import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// En una aplicación real, esto se conectaría a tu base de datos
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Todos los campos obligatorios deben ser completados" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "Ya existe una cuenta con este email" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
