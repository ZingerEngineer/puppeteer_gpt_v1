import z from 'zod'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(6)
const promptSchema = z.string().min(10)
const imageURLSchema = z.string().url()
