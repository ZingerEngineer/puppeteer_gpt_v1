import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import * as fs from 'fs'

import { Page } from 'puppeteer'
import { Calculator } from './types'
puppeteer.use(StealthPlugin())

const loginToProvider = async (
  email: string,
  password: string,
  puppeteerPage: Page
) => {
  await puppeteerPage.waitForSelector(
    'input[type="email"], input[type="password"]',
    {
      visible: true
    }
  )

  // Enter email address
  await puppeteerPage.type('input[type="email"]', email)
  await puppeteerPage.keyboard.press('Enter')

  // Wait for password input
  await puppeteerPage.waitForSelector('input[type="password"]', {
    visible: true
  })
  await puppeteerPage.type('input[type="password"]', password)
  await puppeteerPage.keyboard.press('Enter')

  await puppeteerPage.waitForNavigation({
    waitUntil: 'networkidle0'
  })
  await puppeteerPage.click('button[id="declineButton"]')
}

async function puppeteerScript(imageURL: string) {
  const email = process.env.EMAIL_SECRET as string
  const password = process.env.PASSWORD_SECRET as string
  const prompt =
    'How much calories are in the food inside this image? Criteria: Consider number of elements in the image, color, and size of the elements. Reply only with the total calories calculated in numbers & do not suggest more than one response.'

  if (!imageURL) throw new Error('No image path found')
  let response: string | null = null
  const imageBuffer = fs.readFileSync(imageURL)
  const imageUint8Array = new Uint8Array(imageBuffer)

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

  await page.waitForSelector(
    'button[class="absolute right-1 top-1 -translate-y-1/2 translate-x-1/2 rounded-full transition-colors border-[3px] border-[#f4f4f4] bg-black p-[2px] text-white dark:border-token-main-surface-secondary dark:bg-white dark:text-black"]',
    { visible: true }
  )

  await page.waitForSelector('button[data-testid="send-button"]', {
    visible: true
  })
  await page.evaluate(() => {
    setTimeout(() => {
      const sendButton = document.querySelector(
        'button[data-testid="send-button"]'
      ) as HTMLButtonElement
      if (!sendButton) throw new Error('Send button not found')
      sendButton.click()
    }, 500)
  })

  await page.waitForSelector('div[data-message-author-role="assistant"]', {
    visible: true
  })
  await page.waitForSelector('button[data-testid="send-button"]', {
    visible: true
  })

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
