export type BloodGroup = 
  'A+' | 'A-' | 'B+' | 'B-' | 
  'O+' | 'O-' | 'AB+' | 'AB-'

export type SearchType = 'blood' | 'doctor' | 'ambulance'

export type RequestStatus = 
  'pending' | 'accepted' | 'declined'

export type VehicleType = 'AC' | 'Non-AC' | 'ICU'

export interface User {
  id: string
  auth_id: string
  name: string
  phone: string
  district: string
  upazila: string
  bio?: string
  photo_url?: string
  blood_group: BloodGroup
  is_donor: boolean
  is_doctor: boolean
  doctor_speciality?: string
  chamber_address?: string
  visit_fee?: string
  is_ambulance: boolean
  vehicle_type?: VehicleType
  vehicle_number?: string
  lat?: number
  lng?: number
  total_donations: number
  avg_rating: number
  total_ratings: number
  is_active: boolean
  is_blocked: boolean
  block_reason?: string
  is_admin: boolean
  is_super_admin: boolean
  last_seen?: string
  created_at: string
}

export interface BloodRequest {
  id: string
  requester_id: string
  donor_id: string
  blood_group: BloodGroup
  patient_name?: string
  patient_phone?: string
  hospital_name?: string
  message?: string
  status: RequestStatus
  created_at: string
  requester?: Partial<User>
  donor?: Partial<User>
}

export interface Rating {
  id: string
  rater_id: string
  receiver_id: string
  request_id?: string
  stars: number
  comment?: string
  created_at: string
  rater?: Partial<User>
  receiver?: Partial<User>
}
