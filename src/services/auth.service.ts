
const EXISTING_EMAILS = ["test@test.com", "user@rythmify.com"];

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  return { exists: EXISTING_EMAILS.includes(email.toLowerCase().trim()) };
}
