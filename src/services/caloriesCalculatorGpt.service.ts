import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { loginToProvider } from './util/loginToProvider'

import { Calculator } from './types'
puppeteer.use(StealthPlugin())

async function puppeteerScript(imageURL: string) {
  const email = process.env.EMAIL_SECRET as string
  const password = process.env.PASSWORD_SECRET as string
  const prompt =
    'How much calories are in the food inside this image? Criteria: Consider number of elements in the image, color, and size of the elements. Reply only with the total calories calculated in numbers & do not suggest more than one response.'

  if (!imageURL) throw new Error('No image path found')
  let response: string | null = null

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // Navigate to ChatGPT login page
  await page.goto('https://chat.openai.com')

  await page.waitForNavigation({
    waitUntil: 'networkidle0'
  })

  await page.waitForSelector('button.btn-primary[data-testid="login-button"]', {
    visible: true
  })
  await page.click('button.btn-primary[data-testid="login-button"]')

  await page.waitForSelector('.social-btn', {
    visible: true
  })
  await page.evaluate(() => {
    console.log('filtering')
    const microsoftButton = Array.from(
      document.getElementsByTagName('IMG')
    ).filter((img) => (img as HTMLImageElement).src.includes('microsoft'))[0]
      .parentElement?.parentElement as HTMLButtonElement
    console.log(microsoftButton)
    if (microsoftButton) {
      console.log('clicking')
      microsoftButton.click()
    }
  })

  await loginToProvider(email, password, page)

  // Wait for ChatGPT interface to load
  await page.waitForSelector('textarea', { visible: true })

  // Type and send the prompt
  await page.type('textarea', prompt, {
    delay: 20
  })

  const inputUploadHandle = await page.$('input[class="hidden"]')
  if (!inputUploadHandle) throw new Error('File input element not found')

  await inputUploadHandle.uploadFile(imageURL)

  await page.evaluate(async () => {
    const asyncWait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    const keepCheckingUploadingCircles = async (
      circlesNumber: number,
      milliseconds: number,
      maxAttempts?: number // Optional parameter
    ) => {
      if (maxAttempts !== undefined && maxAttempts <= 0) {
        console.log('Max attempts reached. Stopping recursion.')
        return
      }

      if (circlesNumber > 2) {
        console.log('valueToCheck is falsy.')
        await asyncWait(2000)
        await keepCheckingUploadingCircles(
          circlesNumber,
          milliseconds,
          maxAttempts ? maxAttempts - 1 : undefined
        )
      } else {
        console.log('valueToCheck is truthy.')
        return
      }
    }

    let circles = document.querySelectorAll('circle')
    await keepCheckingUploadingCircles(circles.length, 2000)
  })

  const sendButton = await page.waitForSelector(
    'button[data-testid="send-button"]',
    {
      visible: true
    }
  )

  if (!sendButton) throw new Error('Send button not found')
  sendButton.click()

  response = await page.evaluate(() => {
    const divMessage = document.querySelector(
      'div[data-message-author-role="assistant"]'
    )
    console.log('divMessage', divMessage)

    if (!divMessage) {
      throw new Error('No message found')
    }

    const pElement = divMessage.children[0].children[0]
      .children[0] as HTMLParagraphElement
    return Promise.resolve(pElement.innerText)
  })

  if (!response) throw new Error('No response found')
  if (Number.isNaN(response) === false) throw new Error('Invalid response')

  await browser.close()

  return Number(response)
}

export class CaloriesClaculatorGPT implements Calculator {
  public readonly calculateCalories = async (imageURL: string) => {
    const puppeteerResponse = await puppeteerScript(imageURL)
    return puppeteerResponse
  }
}
