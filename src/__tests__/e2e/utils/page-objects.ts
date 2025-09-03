import { Page } from '@playwright/test'
import { TestHelpers } from './test-helpers'

export class LoginPage {
  private helpers: TestHelpers

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page)
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.helpers.fillForm({
      'email-input': email,
      'password-input': password,
    })
    await this.helpers.submitForm('login-button')
  }

  async forgotPassword(email: string) {
    await this.page.click('[data-testid="forgot-password-link"]')
    await this.helpers.fillForm({ 'email-input': email })
    await this.helpers.submitForm('reset-button')
  }
}

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard')
  }

  async getWelcomeMessage() {
    return await this.page.textContent('[data-testid="welcome-message"]')
  }

  async navigateToSection(section: string) {
    await this.page.click(`[data-testid="nav-${section}"]`)
  }
}

export class QuizPage {
  private helpers: TestHelpers

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page)
  }

  async startQuiz(quizId: string) {
    await this.page.goto(`/quiz/${quizId}`)
    await this.page.click('[data-testid="start-quiz-button"]')
  }

  async answerQuestion(questionIndex: number, answer: string) {
    await this.page.click(
      `[data-testid="question-${questionIndex}-option-${answer}"]`
    )
  }

  async submitQuiz() {
    await this.page.click('[data-testid="submit-quiz-button"]')
    await this.helpers.waitForSuccess()
  }

  async getScore() {
    const scoreText = await this.page.textContent('[data-testid="quiz-score"]')
    return parseInt(scoreText?.match(/\d+/)?.[0] || '0')
  }
}
