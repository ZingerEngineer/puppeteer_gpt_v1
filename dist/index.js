"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function loginAndSendPrompt(email, password, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = null;
        const browser = yield puppeteer_extra_1.default.launch({ headless: false });
        const page = yield browser.newPage();
        // Navigate to ChatGPT login page
        yield page.goto('https://chat.openai.com');
        yield page.waitForNavigation({
            waitUntil: 'networkidle0'
        });
        yield page.waitForSelector('button.btn-primary[data-testid="login-button"]', {
            visible: true
        });
        yield page.click('button.btn-primary[data-testid="login-button"]');
        yield page.waitForSelector('.social-btn', {
            visible: true
        });
        yield page.evaluate(() => {
            var _a;
            console.log('filtering');
            const microsoftButton = (_a = Array.from(document.getElementsByTagName('IMG')).filter((img) => img.src.includes('microsoft'))[0]
                .parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            console.log(microsoftButton);
            if (microsoftButton) {
                console.log('clicking');
                microsoftButton.click();
            }
        });
        yield page.waitForSelector('input[type="email"], input[type="password"]', {
            visible: true
        });
        // Enter email address
        yield page.type('input[type="email"]', email);
        yield page.keyboard.press('Enter');
        // Wait for password input
        yield page.waitForSelector('input[type="password"]', { visible: true });
        yield page.type('input[type="password"]', password);
        yield page.keyboard.press('Enter');
        yield page.waitForNavigation({
            waitUntil: 'networkidle0'
        });
        yield page.click('button[id="declineButton"]');
        // Wait for ChatGPT interface to load
        yield page.waitForSelector('textarea', { visible: true });
        // Type and send the prompt
        yield page.type('textarea', prompt, {
            delay: 20
        });
        yield page.waitForSelector('button[data-testid="send-button"]', {
            visible: true
        });
        yield page.click('button[data-testid="send-button"]');
        const textMessage = yield page.waitForSelector('div[data-message-author-role="assistant"]', {
            visible: true
        });
        yield page.waitForSelector('button[data-testid="send-button"]', {
            visible: true
        });
        response = yield page.evaluate(() => {
            const divMessage = document.querySelector('div[data-message-author-role="assistant"]');
            console.log('divMessage', divMessage);
            if (!divMessage) {
                throw new Error('No message found');
            }
            const pElement = divMessage.children[0].children[0]
                .children[0];
            return Promise.resolve(pElement.innerText);
        });
        console.log(response);
        // Close the browser
        yield browser.close();
    });
}
// Usage
;
(() => {
    const email = process.env.EMAIL_SECRET;
    const password = process.env.PASSWORD_SECRET;
    const prompt = 'What is javascript?';
    console.log(email);
    try {
        if (!email || !password) {
            throw new Error('Please provide email and password in .env file');
        }
        if (email && password) {
            loginAndSendPrompt(email, password, prompt);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
})();
