export interface IInterview {
  id: string
  createdAt: Date
  company: string
  vacancyLink: string
  hrName: string
  contactTelegram?: string
  contactWhatsApp?: string
  contactPhone?: string
  salaryFrom?: number
  salaryTo?: number
  stages?: IInterviewStage[]
  result?: TInterviewResult
}

export interface IInterviewStage {
  name: string
  date: Date | null
  description: string
}

export type TInterviewResult = 'Refusal' | 'Offer'
