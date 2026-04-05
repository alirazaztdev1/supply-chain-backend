import { hash, compare } from 'bcrypt'
import 'dotenv/config'

/**
 * Returns hashed password by hash password.
 *
 * @remarks
 * This method is part of the {@link utils/password}.
 *
 * @param password - 1st input number
 * @returns The hashed password mean of `password`
 *
 * @beta
 */
export const hashPassword = async (password: string): Promise<string> => {
	if (!password) {
		throw new Error('Password is required')
	}
	const saltRounds = Number(process.env.SALT) || 10
	return await hash(password, saltRounds)
}

/**
 * Returns boolean by compare password.
 *
 * @remarks
 * This method is part of the {@link utils/password}.
 *
 * @param password - 1st input number
 * @param hash - The second input number
 * @returns The boolean mean of `password` and `hash`
 *
 * @beta
 */
export const comparePassword = async (
	password: string,
	hash: string
): Promise<boolean> => {
	if (!password || !hash) return false
	return await compare(password, hash)
}
