import { Page } from 'puppeteer'

export const loginToProvider = async (
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
