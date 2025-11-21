// Service for account-related API calls

export const accountService = {
  async createAccount(formData: FormData) {
    const response = await fetch('/api/accounts/create', {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  async deleteAccount(accountId: string) {
    const formData = new FormData()
    formData.append('accountId', accountId)
    
    const response = await fetch('/api/accounts/delete', {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  async setDefaultAccount(accountId: string) {
    const formData = new FormData()
    formData.append('accountId', accountId)
    
    const response = await fetch('/api/accounts/set-default', {
      method: 'POST',
      body: formData,
    })
    return response.json()
  }
}