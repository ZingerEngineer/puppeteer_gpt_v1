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

  await page.evaluate(() => {
    async function asyncWait(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    const keepCheckingUploadingCircles = async (
      circlesNumber: number,
      milliseconds: number,
      maxAttempts?: number // Optional parameter
    ) => {
      if (maxAttempts !== undefined && maxAttempts <= 0) {
        console.log('Max attempts reached. Stopping recursion.')
        return
      }

      let circles = document.querySelectorAll('circle')
      if (circles.length > circlesNumber) {
        console.log('valueToCheck is falsy.')
        await asyncWait(milliseconds)
        return keepCheckingUploadingCircles(
          circlesNumber,
          milliseconds,
          maxAttempts ? maxAttempts - 1 : undefined
        )
      } else {
        console.log('valueToCheck is truthy.')
        return // Exit the recursion
      }
    }
    return keepCheckingUploadingCircles(2, 2000)
  })

  const sendButton = await page.waitForSelector(
    'button[data-testid="send-button"]',
    {
      visible: true
    }
  )

  if (!sendButton) throw new Error('Send button not found')
  sendButton.click()

  await page.waitForSelector('div[data-message-author-role="assistant"]', {
    visible: true
  })

  response = await page.evaluate(() => {
    async function asyncWait(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    const keepCheckingDivMessage = async (
      currentMessageLength: number,
      milliseconds: number,
      maxAttempts?: number
    ) => {
      if (maxAttempts !== undefined && maxAttempts <= 0) {
        console.log('Max attempts reached. Stopping recursion.')
        return null // Return null if max attempts are exhausted
      }

      let divMessage = document.querySelector(
        'div[data-message-author-role="assistant"]'
      )
      if (!divMessage) {
        console.log('divMessage did not spawn.')
        await asyncWait(milliseconds)
        return keepCheckingDivMessage(
          0,
          milliseconds,
          maxAttempts ? maxAttempts - 1 : undefined
        )
      }

      let pElement = divMessage.children[0]?.children[0]?.children[0]
      if (!pElement || !(pElement instanceof HTMLParagraphElement)) {
        console.log('pElement did not spawn.')
        await asyncWait(milliseconds)
        return keepCheckingDivMessage(
          0,
          milliseconds,
          maxAttempts ? maxAttempts - 1 : undefined
        )
      }

      let pElementLength = pElement.innerText.length
      if (pElementLength !== currentMessageLength) {
        console.log('Still not finished generating. Waiting...')
        await asyncWait(milliseconds)
        return keepCheckingDivMessage(
          pElementLength,
          milliseconds,
          maxAttempts ? maxAttempts - 1 : undefined
        )
      }

      console.log('Message generation completed.')
      return pElement.innerText // Return the final message
    }

    // Start the process with 0 length, a delay of 2000ms, and 5 attempts
    return keepCheckingDivMessage(0, 2000)
  })

  console.log('Response:', response)

  if (!response) throw new Error('No response found')
  await browser.close()

  return Number(response)
}

export class CaloriesClaculatorGPT implements Calculator {
  public readonly calculateCalories = async (imageURL: string) => {
    const puppeteerResponse = await puppeteerScript(imageURL)
    return puppeteerResponse
  }
}
