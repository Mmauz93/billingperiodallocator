"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ColorSwatchProps {
  name: string;
  color: string;
}

export default function StyleGuidePage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Style Guide</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Colors</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <ColorSwatch name="Primary" color="hsl(var(--primary))" />
          <ColorSwatch name="Secondary" color="hsl(var(--secondary))" />
          <ColorSwatch name="Accent" color="hsl(var(--accent))" />
          <ColorSwatch name="Muted" color="hsl(var(--muted))" />
          <ColorSwatch name="Background" color="var(--background)" />
          <ColorSwatch name="Foreground" color="hsl(var(--foreground))" />
          <ColorSwatch name="Card" color="var(--card)" />
          <ColorSwatch name="Border" color="hsl(var(--border))" />
          <ColorSwatch name="Ring" color="hsl(var(--ring))" />
          <ColorSwatch name="Destructive" color="hsl(var(--destructive))" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Typography</h2>
        <div className="flex flex-col gap-4">
          <div className="border p-4 rounded-lg">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <p className="text-sm text-muted-foreground">
              font-size: 2.25rem (36px), font-weight: 700
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <p className="text-sm text-muted-foreground">
              font-size: 1.875rem (30px), font-weight: 600
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-2xl font-semibold">Heading 3</h3>
            <p className="text-sm text-muted-foreground">
              font-size: 1.5rem (24px), font-weight: 600
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <h4 className="text-xl font-semibold">Heading 4</h4>
            <p className="text-sm text-muted-foreground">
              font-size: 1.25rem (20px), font-weight: 600
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <p className="text-base">
              Body Text: The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-sm text-muted-foreground">
              font-size: 1rem (16px), font-weight: 400
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <p className="text-sm">
              Small Text: The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-sm text-muted-foreground">
              font-size: 0.875rem (14px), font-weight: 400
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
            Primary
          </button>
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
            Secondary
          </button>
          <button className="bg-muted text-muted-foreground px-4 py-2 rounded-md">
            Muted
          </button>
          <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
            Destructive
          </button>
          <button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
            Outline
          </button>
          <button className="px-4 py-2 rounded-md" disabled>
            Disabled
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md">
            Small
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
            Default
          </button>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md">
            Large
          </button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Card Level 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Default card with level 1 shadow.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Card Level 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with level 2 shadow.</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Card Level 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with level 3 shadow.</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Card Level 4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with level 4 shadow.</p>
            </CardContent>
          </Card>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Card Level 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with level 5 shadow.</p>
            </CardContent>
          </Card>
          <Card className="bg-background dark:bg-muted text-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-medium mb-2">
                Dark Muted Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with muted background in dark mode.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="input">
              Text Input
            </label>
            <input
              type="text"
              id="input"
              placeholder="Enter text here"
              className="w-full px-3 py-2 border border-input rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="select">
              Select
            </label>
            <select
              id="select"
              className="w-full px-3 py-2 border border-input rounded-md"
            >
              <option value="">Select an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="textarea"
            >
              Textarea
            </label>
            <textarea
              id="textarea"
              placeholder="Enter text here"
              className="w-full px-3 py-2 border border-input rounded-md"
              rows={3}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Checkbox</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="checkbox"
                className="rounded border-input mr-2"
              />
              <label htmlFor="checkbox">Option label</label>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Dark Mode Toggle</h2>
        <p>
          Click the theme toggle in the header to switch between light and dark
          mode.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This will help verify that all theme variables are properly
          transitioning between modes.
        </p>
      </section>
    </div>
  );
}

function ColorSwatch({ name, color }: ColorSwatchProps) {
  return (
    <div className="flex flex-col">
      <div
        className="w-full h-20 rounded-md mb-2 border border-border"
        style={{ backgroundColor: color }}
      ></div>
      <div className="text-sm font-medium text-foreground">{name}</div>
      <div className="text-xs text-muted-foreground font-mono">{color}</div>
    </div>
  );
}
