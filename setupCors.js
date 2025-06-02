import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function configureCors() {
  const { error } = await supabase
    .storage
    .setCorsConfig({
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'HEAD'],
      allowedHeaders: ['*'],
      maxAgeSeconds: 3600
    })

  if (error) {
    console.error('Error configuring CORS:', error)
  } else {
    console.log('CORS configured successfully')
  }
}

configureCors()
