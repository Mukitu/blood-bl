'use client'

import { useEffect, useState } from 'react'
import { supabase, phoneToEmail } from '@/lib/supabase'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile(session: any) {
      if (!session?.user || !mounted) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle()
        
        if (error) {
          console.error('Error loading profile:', error)
          throw error
        }

        if (data) {
          if (mounted) setUser(data)
        } else {
          console.warn('No profile found for authenticated user:', session.user.id)
          // If no profile found, we might want to sign out or redirect to a setup page
          // For now, we'll just let the user be null which will trigger a redirect to login
          if (mounted) setUser(null)
        }
      } catch (error) {
        console.error('Error in loadProfile:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session)
      } else {
        if (mounted) setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadProfile(session)
        } else {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(userData: any) {
    const email = phoneToEmail(userData.phone)
    console.log('Signing up with email:', email)
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: userData.password,
    })
    
    if (error) {
      console.error('Signup error:', error)
      throw error
    }
    if (!authData.user) throw new Error('Auth user creation failed')
 
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        name: userData.name,
        email,
        phone: userData.phone,
        blood_group: userData.blood_group,
        district: userData.district,
        upazila: userData.upazila,
        bio: userData.bio || null,
        is_donor: true,
        is_doctor: userData.is_doctor,
        doctor_speciality: userData.doctor_speciality || null,
        chamber_address: userData.chamber_address || null,
        visit_fee: userData.visit_fee || null,
        is_ambulance: userData.is_ambulance,
        vehicle_type: userData.vehicle_type || null,
        vehicle_number: userData.vehicle_number || null,
        lat: userData.lat || null,
        lng: userData.lng || null,
      })
 
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup auth user if profile creation fails
      await supabase.auth.signOut()
      throw profileError
    }

    return authData
  }
  
  async function signIn(identifier: string, password: string) {
    console.log('useAuth: signIn called with identifier:', identifier)
    // Check if identifier is a phone number
    const isPhone = /^\d+$/.test(identifier.replace(/\D/g, '')) && identifier.length >= 10
    const email = isPhone ? phoneToEmail(identifier) : identifier
    console.log('useAuth: signIn - Computed email:', email)

    console.log('useAuth: signIn - Calling supabase.auth.signInWithPassword...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('useAuth: signIn - Supabase error:', error)
      throw error
    }
    console.log('useAuth: signIn - Supabase success, data:', data)
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  return { user, loading, signUp, signIn, signOut, updatePassword }
}
