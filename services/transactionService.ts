// Service for transaction-related API calls

export const transactionService = {
  async createTransaction(formData: FormData) {
    const response = await fetch('/api/transactions/create', {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  async updateTransaction(id: string, formData: FormData) {
    const response = await fetch(`/api/transactions/update/${id}`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  async deleteTransaction(id: string) {
    const response = await fetch(`/api/transactions/delete/${id}`, {
      method: 'POST',
    })
    return response.json()
  },

  async getTransactions(accountId?: string) {
    const url = accountId 
      ? `/api/transactions/list?account=${accountId}` 
      : '/api/transactions/list'
      
    const response = await fetch(url)
    return response.json()
  }
}