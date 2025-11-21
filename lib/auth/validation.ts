export function validateLoginForm(email: string, password: string) {
  const errors: {email?: string, password?: string} = {}
  
  // Email validation
  if (!email) {
    errors.email = "Email is required"
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Email address is invalid"
  }
  
  // Password validation
  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateSignupForm(email: string, password: string, confirmPassword: string) {
  const errors: {email?: string, password?: string, confirmPassword?: string} = {}
  
  // Email validation
  if (!email) {
    errors.email = "Email is required"
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Email address is invalid"
  }
  
  // Password validation
  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }
  
  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password"
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}