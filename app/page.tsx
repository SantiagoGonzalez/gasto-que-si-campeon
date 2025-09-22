"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calculator, Receipt, ArrowRight, PlusCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import {
  PAGE_H1_TEXT_1_EN,
  PAGE_H1_TEXT_1_ES,
  PAGE_SPAN_TEXT_1_EN,
  PAGE_SPAN_TEXT_1_ES,
  PAGE_P_TEXT_1_EN,
  PAGE_P_TEXT_1_ES,
  PAGE_BUTTON_TEXT_1_EN,
  PAGE_BUTTON_TEXT_1_ES,
  PAGE_H2_TEXT_1_EN,
  PAGE_H2_TEXT_1_ES,
  PAGE_CARD_TITLE_1_EN,
  PAGE_CARD_TITLE_1_ES,
  PAGE_CARD_DESC_1_EN,
  PAGE_CARD_DESC_1_ES,
  PAGE_LIST_ITEM_1_EN,
  PAGE_LIST_ITEM_1_ES,
  PAGE_LIST_ITEM_2_EN,
  PAGE_LIST_ITEM_2_ES,
  PAGE_LIST_ITEM_3_EN,
  PAGE_LIST_ITEM_3_ES,
  PAGE_LIST_ITEM_4_EN,
  PAGE_LIST_ITEM_4_ES,
  PAGE_CARD_TITLE_2_EN,
  PAGE_CARD_TITLE_2_ES,
  PAGE_CARD_DESC_2_EN,
  PAGE_CARD_DESC_2_ES,
  PAGE_LIST_ITEM_5_EN,
  PAGE_LIST_ITEM_5_ES,
  PAGE_LIST_ITEM_6_EN,
  PAGE_LIST_ITEM_6_ES,
  PAGE_LIST_ITEM_7_EN,
  PAGE_LIST_ITEM_7_ES,
  PAGE_LIST_ITEM_8_EN,
  PAGE_LIST_ITEM_8_ES,
  PAGE_CARD_TITLE_3_EN,
  PAGE_CARD_TITLE_3_ES,
  PAGE_CARD_DESC_3_EN,
  PAGE_CARD_DESC_3_ES,
  PAGE_LIST_ITEM_9_EN,
  PAGE_LIST_ITEM_9_ES,
  PAGE_LIST_ITEM_10_EN,
  PAGE_LIST_ITEM_10_ES,
  PAGE_LIST_ITEM_11_EN,
  PAGE_LIST_ITEM_11_ES,
  PAGE_LIST_ITEM_12_EN,
  PAGE_LIST_ITEM_12_ES,
  PAGE_H2_TEXT_2_EN,
  PAGE_H2_TEXT_2_ES,
  PAGE_FEATURE_TITLE_1_EN,
  PAGE_FEATURE_TITLE_1_ES,
  PAGE_FEATURE_DESC_1_EN,
  PAGE_FEATURE_DESC_1_ES,
  PAGE_FEATURE_TITLE_2_EN,
  PAGE_FEATURE_TITLE_2_ES,
  PAGE_FEATURE_DESC_2_EN,
  PAGE_FEATURE_DESC_2_ES,
  PAGE_FEATURE_TITLE_3_EN,
  PAGE_FEATURE_TITLE_3_ES,
  PAGE_FEATURE_DESC_3_EN,
  PAGE_FEATURE_DESC_3_ES,
  PAGE_FEATURE_TITLE_4_EN,
  PAGE_FEATURE_TITLE_4_ES,
  PAGE_FEATURE_DESC_4_EN,
  PAGE_FEATURE_DESC_4_ES,
  PAGE_H2_TEXT_3_EN,
  PAGE_H2_TEXT_3_ES,
  PAGE_P_TEXT_2_EN,
  PAGE_P_TEXT_2_ES,
  PAGE_BUTTON_TEXT_2_EN,
  PAGE_BUTTON_TEXT_2_ES,
  PAGE_BUTTON_TEXT_3_EN,
  PAGE_BUTTON_TEXT_3_ES,
} from "@/lib/text-languages"

export default function Home() {
  const { language } = useLanguage()

  const getText = (enText: string, esText: string) => {
    return language === "EN" ? enText : esText
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
          {getText(PAGE_H1_TEXT_1_EN, PAGE_H1_TEXT_1_ES)}{" "}
          <span className="text-primary">{getText(PAGE_SPAN_TEXT_1_EN, PAGE_SPAN_TEXT_1_ES)}</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          {getText(PAGE_P_TEXT_1_EN, PAGE_P_TEXT_1_ES)}
        </p>
        <Link href="/gatherings/new">
          <Button size="lg" className="gap-2 h-12 px-8 text-lg">
            <PlusCircle className="h-5 w-5" />
            {getText(PAGE_BUTTON_TEXT_1_EN, PAGE_BUTTON_TEXT_1_ES)}
          </Button>
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{getText(PAGE_H2_TEXT_1_EN, PAGE_H2_TEXT_1_ES)}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1: Create Gathering */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <CardTitle>{getText(PAGE_CARD_TITLE_1_EN, PAGE_CARD_TITLE_1_ES)}</CardTitle>
              <CardDescription>{getText(PAGE_CARD_DESC_1_EN, PAGE_CARD_DESC_1_ES)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {getText(PAGE_LIST_ITEM_1_EN, PAGE_LIST_ITEM_1_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_2_EN, PAGE_LIST_ITEM_2_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_3_EN, PAGE_LIST_ITEM_3_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_4_EN, PAGE_LIST_ITEM_4_ES)}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 2: Add Expenses */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <CardTitle>{getText(PAGE_CARD_TITLE_2_EN, PAGE_CARD_TITLE_2_ES)}</CardTitle>
              <CardDescription>{getText(PAGE_CARD_DESC_2_EN, PAGE_CARD_DESC_2_ES)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {getText(PAGE_LIST_ITEM_5_EN, PAGE_LIST_ITEM_5_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_6_EN, PAGE_LIST_ITEM_6_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_7_EN, PAGE_LIST_ITEM_7_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_8_EN, PAGE_LIST_ITEM_8_ES)}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 3: Calculate & Settle */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <CardTitle>{getText(PAGE_CARD_TITLE_3_EN, PAGE_CARD_TITLE_3_ES)}</CardTitle>
              <CardDescription>{getText(PAGE_CARD_DESC_3_EN, PAGE_CARD_DESC_3_ES)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {getText(PAGE_LIST_ITEM_9_EN, PAGE_LIST_ITEM_9_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_10_EN, PAGE_LIST_ITEM_10_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_11_EN, PAGE_LIST_ITEM_11_ES)}</li>
                <li>• {getText(PAGE_LIST_ITEM_12_EN, PAGE_LIST_ITEM_12_ES)}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{getText(PAGE_H2_TEXT_2_EN, PAGE_H2_TEXT_2_ES)}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">🌱</div>
                {getText(PAGE_FEATURE_TITLE_1_EN, PAGE_FEATURE_TITLE_1_ES)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getText(PAGE_FEATURE_DESC_1_EN, PAGE_FEATURE_DESC_1_ES)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">💰</div>
                {getText(PAGE_FEATURE_TITLE_2_EN, PAGE_FEATURE_TITLE_2_ES)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getText(PAGE_FEATURE_DESC_2_EN, PAGE_FEATURE_DESC_2_ES)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">📅</div>
                {getText(PAGE_FEATURE_TITLE_3_EN, PAGE_FEATURE_TITLE_3_ES)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getText(PAGE_FEATURE_DESC_3_EN, PAGE_FEATURE_DESC_3_ES)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">👥</div>
                {getText(PAGE_FEATURE_TITLE_4_EN, PAGE_FEATURE_TITLE_4_ES)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getText(PAGE_FEATURE_DESC_4_EN, PAGE_FEATURE_DESC_4_ES)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted/50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4">{getText(PAGE_H2_TEXT_3_EN, PAGE_H2_TEXT_3_ES)}</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {getText(PAGE_P_TEXT_2_EN, PAGE_P_TEXT_2_ES)}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/gatherings/new">
            <Button size="lg" className="gap-2 h-12 px-8">
              <PlusCircle className="h-5 w-5" />
              {getText(PAGE_BUTTON_TEXT_2_EN, PAGE_BUTTON_TEXT_2_ES)}
            </Button>
          </Link>
          <Link href="/gatherings">
            <Button variant="outline" size="lg" className="gap-2 h-12 px-8 bg-transparent">
              {getText(PAGE_BUTTON_TEXT_3_EN, PAGE_BUTTON_TEXT_3_ES)}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
