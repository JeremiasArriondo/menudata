"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, GripVertical, Save, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Dish {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  featured: boolean
  available: boolean
  views: number
  rating: number
}

interface Category {
  id: string
  name: string
  icon: string
  dishes: Dish[]
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "entradas",
      name: "Entradas",
      icon: "🍕",
      dishes: [
        {
          id: "1",
          name: "Pizza Margherita",
          description: "Tomate, mozzarella, albahaca fresca",
          price: 2500,
          category: "entradas",
          featured: true,
          available: true,
          views: 156,
          rating: 4.8,
        },
        {
          id: "2",
          name: "Empanadas Criollas",
          description: "Carne cortada a cuchillo, cebolla, huevo",
          price: 800,
          category: "entradas",
          featured: false,
          available: true,
          views: 89,
          rating: 4.5,
        },
      ],
    },
    {
      id: "principales",
      name: "Principales",
      icon: "🥘",
      dishes: [
        {
          id: "3",
          name: "Milanesa Napolitana",
          description: "Con papas fritas caseras",
          price: 3200,
          category: "principales",
          featured: true,
          available: true,
          views: 234,
          rating: 4.9,
        },
        {
          id: "4",
          name: "Bife de Chorizo",
          description: "Con ensalada mixta",
          price: 4500,
          category: "principales",
          featured: false,
          available: false,
          views: 67,
          rating: 4.7,
        },
      ],
    },
    {
      id: "postres",
      name: "Postres",
      icon: "🍰",
      dishes: [
        {
          id: "5",
          name: "Tiramisu Casero",
          description: "Receta tradicional italiana",
          price: 1800,
          category: "postres",
          featured: false,
          available: true,
          views: 123,
          rating: 4.6,
        },
      ],
    },
    {
      id: "bebidas",
      name: "Bebidas",
      icon: "🥤",
      dishes: [
        {
          id: "6",
          name: "Agua Mineral",
          description: "500ml",
          price: 500,
          category: "bebidas",
          featured: false,
          available: true,
          views: 45,
          rating: 4.2,
        },
      ],
    },
  ])

  const [draggedDish, setDraggedDish] = useState<Dish | null>(null)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [isAddingDish, setIsAddingDish] = useState(false)
  const [newDish, setNewDish] = useState<Partial<Dish>>({
    name: "",
    description: "",
    price: 0,
    category: "entradas",
    featured: false,
    available: true,
  })

  const handleDragStart = (dish: Dish) => {
    setDraggedDish(dish)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    if (!draggedDish) return

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id === draggedDish.category) {
          return {
            ...category,
            dishes: category.dishes.filter((dish) => dish.id !== draggedDish.id),
          }
        }
        if (category.id === targetCategoryId) {
          return {
            ...category,
            dishes: [...category.dishes, { ...draggedDish, category: targetCategoryId }],
          }
        }
        return category
      }),
    )
    setDraggedDish(null)
  }

  const handleSaveDish = () => {
    if (editingDish) {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          dishes: category.dishes.map((dish) => (dish.id === editingDish.id ? editingDish : dish)),
        })),
      )
      setEditingDish(null)
    }
  }

  const handleAddDish = () => {
    if (newDish.name && newDish.description && newDish.price && newDish.category) {
      const dish: Dish = {
        id: Date.now().toString(),
        name: newDish.name,
        description: newDish.description,
        price: newDish.price,
        category: newDish.category,
        featured: newDish.featured || false,
        available: newDish.available || true,
        views: 0,
        rating: 0,
      }

      setCategories((prev) =>
        prev.map((category) =>
          category.id === dish.category ? { ...category, dishes: [...category.dishes, dish] } : category,
        ),
      )

      setNewDish({
        name: "",
        description: "",
        price: 0,
        category: "entradas",
        featured: false,
        available: true,
      })
      setIsAddingDish(false)
    }
  }

  const handleDeleteDish = (dishId: string) => {
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        dishes: category.dishes.filter((dish) => dish.id !== dishId),
      })),
    )
  }

  const totalDishes = categories.reduce((acc, category) => acc + category.dishes.length, 0)
  const totalViews = categories.reduce(
    (acc, category) => acc + category.dishes.reduce((dishAcc, dish) => dishAcc + dish.views, 0),
    0,
  )
  const featuredDishes = categories.reduce(
    (acc, category) => acc + category.dishes.filter((dish) => dish.featured).length,
    0,
  )

  return (
    <div className="min-h-screen bg-brand-bg-100">
      {/* Header */}
      <header className="bg-white dark:bg-brand-primary-300 shadow-sm border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-text-200">Panel de Administración</h1>
              <p className="text-brand-text-100 mt-1">Gestiona tu menú digital</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsAddingDish(true)}
                className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Plato
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-brand-primary-100/20 to-brand-primary-200/20 border-brand-primary-100/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-text-100">Total de Platos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary-100">{totalDishes}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-brand-accent-100/20 to-brand-accent-200/20 border-brand-accent-100/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-text-100">Platos Destacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-accent-200">{featuredDishes}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-brand-primary-200/20 to-brand-primary-100/20 border-brand-primary-200/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-text-100">Total de Vistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary-200">{totalViews}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-brand-bg-200/50 to-brand-bg-300/50 border-brand-bg-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-text-100">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-text-200">{categories.length}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Management */}
      <section className="container mx-auto px-4 pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-text-200 mb-2">Gestión del Menú</h2>
          <p className="text-brand-text-100">Arrastra y suelta los platos para reorganizar o cambiar de categoría</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-brand-primary-300/10 rounded-2xl shadow-lg border border-brand-bg-300 p-6"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text-200">{category.name}</h3>
                    <p className="text-sm text-brand-text-100">{category.dishes.length} platos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 min-h-[200px]">
                {category.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    draggable
                    onDragStart={() => handleDragStart(dish)}
                    className="bg-brand-bg-100 dark:bg-brand-primary-300/20 rounded-xl p-4 border border-brand-bg-300 cursor-move hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-brand-text-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-brand-text-200 text-sm">{dish.name}</h4>
                          <p className="text-xs text-brand-text-100 mt-1 line-clamp-2">{dish.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDish(dish)}
                          className="h-8 w-8 p-0 hover:bg-brand-primary-100/20"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDish(dish.id)}
                          className="h-8 w-8 p-0 hover:bg-brand-primary-200/20 text-brand-primary-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-brand-primary-100">${dish.price}</span>
                        {dish.featured && (
                          <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-brand-text-100">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{dish.views}</span>
                        </div>
                        {dish.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-current text-brand-primary-200" />
                            <span>{dish.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={dish.available}
                          onCheckedChange={(checked) => {
                            setCategories((prev) =>
                              prev.map((cat) => ({
                                ...cat,
                                dishes: cat.dishes.map((d) => (d.id === dish.id ? { ...d, available: checked } : d)),
                              })),
                            )
                          }}
                          className="scale-75"
                        />
                        <Label className="text-xs text-brand-text-100">
                          {dish.available ? "Disponible" : "No disponible"}
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}

                {category.dishes.length === 0 && (
                  <div className="text-center py-8 text-brand-text-100">
                    <p className="text-sm">No hay platos en esta categoría</p>
                    <p className="text-xs mt-1">Arrastra platos aquí o agrega uno nuevo</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Dish Dialog */}
      <Dialog open={isAddingDish} onOpenChange={setIsAddingDish}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-200">Agregar Nuevo Plato</DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Completa la información del nuevo plato para tu menú
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-brand-text-200">
                Nombre del plato
              </Label>
              <Input
                id="name"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                placeholder="Ej: Pizza Margherita"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-brand-text-200">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                placeholder="Ej: Tomate, mozzarella, albahaca fresca"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-brand-text-200">
                  Precio
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: Number(e.target.value) })}
                  placeholder="2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-brand-text-200">
                  Categoría
                </Label>
                <Select value={newDish.category} onValueChange={(value) => setNewDish({ ...newDish, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newDish.featured}
                onCheckedChange={(checked) => setNewDish({ ...newDish, featured: checked })}
              />
              <Label className="text-brand-text-200">Marcar como destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newDish.available}
                onCheckedChange={(checked) => setNewDish({ ...newDish, available: checked })}
              />
              <Label className="text-brand-text-200">Disponible</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingDish(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddDish}
              className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
            >
              Agregar Plato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dish Dialog */}
      <Dialog open={!!editingDish} onOpenChange={() => setEditingDish(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-200">Editar Plato</DialogTitle>
            <DialogDescription className="text-brand-text-100">Modifica la información del plato</DialogDescription>
          </DialogHeader>
          {editingDish && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-brand-text-200">
                  Nombre del plato
                </Label>
                <Input
                  id="edit-name"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-brand-text-200">
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-price" className="text-brand-text-200">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingDish.price}
                  onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingDish.featured}
                  onCheckedChange={(checked) => setEditingDish({ ...editingDish, featured: checked })}
                />
                <Label className="text-brand-text-200">Marcar como destacado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingDish.available}
                  onCheckedChange={(checked) => setEditingDish({ ...editingDish, available: checked })}
                />
                <Label className="text-brand-text-200">Disponible</Label>
              </div>
              <div className="bg-brand-bg-200 p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-text-100">Vistas:</span>
                  <span className="font-semibold text-brand-text-200">{editingDish.views}</span>
                </div>
                {editingDish.rating > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-brand-text-100">Calificación:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-brand-primary-200" />
                      <span className="font-semibold text-brand-text-200">{editingDish.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingDish(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDish}
              className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
