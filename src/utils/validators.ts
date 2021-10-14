import { FormItemRule } from 'naive-ui'

export function validateEmail(rule: FormItemRule, email: string): boolean {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ? true : false
}
