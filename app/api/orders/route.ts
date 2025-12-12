import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente admin com service role key (server-side)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validações básicas
    if (!orderData.product_name || !orderData.customer_name || !orderData.customer_whatsapp) {
      return NextResponse.json(
        { error: 'Dados obrigatórios em falta' },
        { status: 400 }
      )
    }

    // Inserir pedido usando service role (bypassa RLS)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) {
      console.error('Erro no Supabase:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('Pedido criado com sucesso:', order)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Erro na API de pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}