"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  Eye,
  GripVertical,
  Plus,
  QrCode,
  Save,
  Smartphone,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  featured: boolean;
  image?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export default function CrearMenuPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: "entradas", name: "Entradas", icon: "🍕", items: [] },
    { id: "principales", name: "Principales", icon: "🥘", items: [] },
    { id: "postres", name: "Postres", icon: "🍰", items: [] },
    { id: "bebidas", name: "Bebidas", icon: "🥤", items: [] },
  ]);

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "entradas",
    featured: false,
  });

  // Platos de ejemplo para arrastrar
  const exampleItems: MenuItem[] = [
    {
      id: "ex1",
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, albahaca fresca",
      price: 2500,
      category: "entradas",
      featured: false,
    },
    {
      id: "ex2",
      name: "Empanadas Criollas",
      description: "Carne cortada a cuchillo, cebolla, huevo",
      price: 800,
      category: "entradas",
      featured: false,
    },
    {
      id: "ex3",
      name: "Milanesa Napolitana",
      description: "Con papas fritas caseras",
      price: 3200,
      category: "principales",
      featured: true,
    },
    {
      id: "ex4",
      name: "Bife de Chorizo",
      description: "Con ensalada mixta",
      price: 4500,
      category: "principales",
      featured: false,
    },
    {
      id: "ex5",
      name: "Tiramisu Casero",
      description: "Receta tradicional italiana",
      price: 1800,
      category: "postres",
      featured: false,
    },
    {
      id: "ex6",
      name: "Agua Mineral",
      description: "500ml",
      price: 500,
      category: "bebidas",
      featured: false,
    },
    {
      id: "ex7",
      name: "Coca Cola",
      description: "500ml",
      price: 800,
      category: "bebidas",
      featured: false,
    },
    {
      id: "ex8",
      name: "Flan Casero",
      description: "Con dulce de leche",
      price: 1200,
      category: "postres",
      featured: false,
    },
  ];

  const handleDragStart = (item: MenuItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newItem: MenuItem = {
      ...draggedItem,
      id: `${categoryId}-${Date.now()}`,
      category: categoryId,
    };

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );
    setDraggedItem(null);
  };

  const handleAddCustomItem = () => {
    if (
      newItem.name &&
      newItem.description &&
      newItem.price &&
      newItem.category
    ) {
      const item: MenuItem = {
        id: `custom-${Date.now()}`,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        category: newItem.category,
        featured: newItem.featured || false,
      };

      setCategories((prev) =>
        prev.map((category) =>
          category.id === item.category
            ? { ...category, items: [...category.items, item] }
            : category
        )
      );

      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "entradas",
        featured: false,
      });
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category
      )
    );
  };

  const handleEditItem = () => {
    if (editingItem) {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === editingItem.id ? editingItem : item
          ),
        }))
      );
      setEditingItem(null);
    }
  };

  const totalItems = categories.reduce(
    (acc, category) => acc + category.items.length,
    0
  );

  const steps = [
    {
      number: 1,
      title: "Información del Restaurante",
      description: "Nombre y datos básicos",
    },
    {
      number: 2,
      title: "Crear tu Menú",
      description: "Agrega y organiza tus platos",
    },
    {
      number: 3,
      title: "Personalización",
      description: "Ajusta el diseño y configuración",
    },
    { number: 4, title: "Publicar", description: "Tu menú estará listo" },
  ];

  return (
    <div className="min-h-screen bg-brand-bg-100">
      {/* Header */}
      <header className="bg-white dark:bg-brand-text-100 shadow-sm border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-brand-text-100 hover:text-brand-primary-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al inicio</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
                  Constructor de Menú
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white">
                <Save className="h-4 w-4 mr-2" />
                Guardar Menú
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <section className="bg-white dark:bg-brand-text-100/10 border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white"
                        : "bg-brand-bg-200 text-brand-text-200"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-brand-text-200">
                      {step.title}
                    </p>
                    <p className="text-xs text-brand-text-100">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-brand-primary-100"
                        : "bg-brand-bg-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text-200">
                  Información del Restaurante
                </CardTitle>
                <p className="text-brand-text-100">
                  Empecemos con los datos básicos de tu restaurante
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="restaurant-name"
                    className="text-brand-text-200 font-medium"
                  >
                    Nombre del Restaurante
                  </Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ej: La Pizzería de Mario"
                    className="mt-2"
                  />
                  <p className="text-sm text-brand-text-100 mt-1">
                    Tu menú estará disponible en: menudata.com/
                    {restaurantName.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!restaurantName.trim()}
                    className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platos de Ejemplo */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-text-200 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Platos Disponibles
                  </CardTitle>
                  <p className="text-sm text-brand-text-100">
                    Arrastra los platos a tu menú o crea uno personalizado
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {exampleItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        className="bg-brand-bg-100 border-brand-bg-300 p-3 rounded-lg border cursor-move hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <GripVertical className="h-4 w-4 text-brand-text-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-text-200 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-brand-text-100 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-primary-100">
                            ${item.price}
                          </span>
                          {item.featured && (
                            <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    variant="outline"
                    className="w-full border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Plato Personalizado
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Constructor del Menú */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                  Menú de {restaurantName || "Tu Restaurante"}
                </h2>
                <p className="text-brand-text-100">
                  Arrastra platos desde la columna izquierda a las categorías
                  correspondientes
                </p>
                <div className="mt-4 flex items-center space-x-4">
                  <Badge className="bg-brand-accent-100 text-brand-text-200">
                    {totalItems} platos agregados
                  </Badge>
                  <Badge className="bg-brand-primary-200 text-white">
                    {categories.filter((cat) => cat.items.length > 0).length}{" "}
                    categorías activas
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300 min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-brand-text-200 flex items-center">
                        <span className="text-xl mr-2">{category.icon}</span>
                        {category.name}
                        <Badge className="ml-2 bg-brand-bg-200 text-brand-text-200">
                          {category.items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-brand-bg-100 p-3 rounded-lg border border-brand-bg-300 group hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-brand-text-200 text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-brand-text-100 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItem(item)}
                                  className="h-6 w-6 p-0 hover:bg-brand-primary-100/20"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleRemoveItem(category.id, item.id)
                                  }
                                  className="h-6 w-6 p-0 hover:bg-brand-primary-200/20 text-brand-primary-200"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-brand-primary-100">
                                ${item.price}
                              </span>
                              {item.featured && (
                                <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Destacado
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {category.items.length === 0 && (
                          <div className="text-center py-8 text-brand-text-100 border-2 border-dashed border-brand-bg-300 rounded-lg">
                            <p className="text-sm">Arrastra platos aquí</p>
                            <p className="text-xs mt-1">
                              o crea uno personalizado
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-brand-text-100 text-brand-text-100"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={totalItems === 0}
                  className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text-200">
                  ¡Menú Creado Exitosamente! 🎉
                </CardTitle>
                <p className="text-brand-text-100">
                  Tu menú digital está listo. Aquí tienes los próximos pasos:
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-brand-bg-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <QrCode className="h-8 w-8 text-brand-primary-100" />
                      <div>
                        <h3 className="font-bold text-brand-text-200">
                          Tu QR personalizado
                        </h3>
                        <p className="text-sm text-brand-text-100">
                          Listo para descargar e imprimir
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white bg-transparent"
                    >
                      Descargar QR
                    </Button>
                  </div>
                  <div className="bg-brand-bg-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <Smartphone className="h-8 w-8 text-brand-accent-200" />
                      <div>
                        <h3 className="font-bold text-brand-text-200">
                          Link directo
                        </h3>
                        <p className="text-sm text-brand-text-100">
                          Comparte con tus clientes
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-brand-bg-300">
                      <p className="text-sm text-brand-primary-100 font-mono">
                        menudata.com/
                        {restaurantName.toLowerCase().replace(/\s+/g, "-")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-brand-accent-100/20 to-brand-accent-200/20 p-6 rounded-xl border border-brand-accent-100/30">
                  <h3 className="font-bold text-brand-text-200 mb-2">
                    ¿Qué sigue?
                  </h3>
                  <ul className="space-y-2 text-brand-text-100">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-brand-accent-200 rounded-full"></span>
                      <span>
                        Te contactaremos por WhatsApp para finalizar la
                        configuración
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-brand-accent-200 rounded-full"></span>
                      <span>Tu menú estará publicado en 24-48 horas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-brand-accent-200 rounded-full"></span>
                      <span>Recibirás el QR y link final listos para usar</span>
                    </li>
                  </ul>
                </div>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white px-8"
                  >
                    Finalizar y Publicar Menú
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Custom Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-100">
              Crear Plato Personalizado
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Agrega un plato único de tu restaurante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-brand-text-200">
                Nombre del plato
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Ej: Especialidad de la casa"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-brand-text-200">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Describe los ingredientes y preparación"
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
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  placeholder="2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-brand-text-200">
                  Categoría
                </Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category: value })
                  }
                >
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
                checked={newItem.featured}
                onCheckedChange={(checked) =>
                  setNewItem({ ...newItem, featured: checked })
                }
              />
              <Label className="text-brand-text-200">
                Marcar como destacado
              </Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingItem(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddCustomItem}
              className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
            >
              Agregar Plato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-100">
              Editar Plato
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Modifica la información del plato
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-brand-text-200">
                  Nombre del plato
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-description"
                  className="text-brand-text-200"
                >
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
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
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: Number(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingItem.featured}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, featured: checked })
                  }
                />
                <Label className="text-brand-text-200">
                  Marcar como destacado
                </Label>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditItem}
              className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-text-200 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Vista Previa del Menú
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Así verán tu menú los clientes en sus celulares
            </DialogDescription>
          </DialogHeader>
          <div className="bg-brand-bg-100 p-4 rounded-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-brand-text-200">
                {restaurantName || "Tu Restaurante"}
              </h2>
              <p className="text-sm text-brand-text-100 mt-1">
                menudata.com/{restaurantName.toLowerCase().replace(/\s+/g, "-")}
              </p>
            </div>
            {categories
              .filter((category) => category.items.length > 0)
              .map((category) => (
                <div key={category.id} className="mb-6">
                  <h3 className="text-lg font-bold text-brand-text-200 mb-3 flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border-brand-bg-300 p-3 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-brand-text-200">
                            {item.name}
                          </h4>
                          {item.featured && (
                            <Star className="h-4 w-4 text-brand-primary-200 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-brand-text-100 mb-2">
                          {item.description}
                        </p>
                        <p className="font-bold text-brand-primary-100">
                          ${item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
