export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  author?: string;
  category?: string;
  content?: string;
}

export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How did Beehauz start?',
    excerpt: 'The inspiring story behind Beehauz and how we became the go-to platform for student housing solutions.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=200&fit=crop',
    readTime: '5 min read',
    date: 'Sep 25, 2025',
    author: 'Airone Vonn Villasor',
    category: 'Founding Story',
    content: `# How did Beehauz start?

The story of Beehauz began in 2024 when our founder, Airone Vonn Villasor, was a university student working on his capstone project. What started as a school requirement has now grown into your ultimate boarding house portal.

## The Problem

Finding student accommodation was traditionally a word-of-mouth process, often leading to:
- Limited options and information
- Unreliable listings
- No standardized pricing
- Difficulty comparing different properties
- Safety and security concerns

## The Solution

Beehauz was born from the idea of creating a centralized platform where students could:
- Browse verified boarding house listings
- Compare prices and amenities
- Read authentic reviews from other students
- Connect directly with property owners
- Access additional student services

## Our Mission

Today, Beehauz serves as your one-stop student services app, connecting students with not just housing, but also laundry services (Palaba) and food delivery (Pabakal) coming soon! - making student life more convenient and affordable.

We believe that every student deserves a safe, affordable, and comfortable place to call home while pursuing their education.`
  },
  {
    id: '2',
    title: 'Student Budget Guide: Managing Your Money',
    excerpt: 'Learn how to budget effectively as a student, including housing costs, food expenses, and saving tips.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
    readTime: '7 min read',
    date: 'Sep 22, 2025',
    author: 'Financial Advisor',
    category: 'Money Management',
    content: `# Student Budget Guide: Managing Your Money

Managing finances as a student can be challenging, but with the right strategies, you can make your money stretch further while still enjoying your university experience.

## Creating Your Budget

### 1. List Your Income Sources
- Monthly allowance from family
- Part-time job earnings
- Scholarships or grants
- Any other regular income

### 2. Track Your Expenses
- Housing (boarding house rent)
- Food and groceries
- Transportation
- School supplies
- Entertainment
- Emergency fund

## Housing Budget Tips

### Boarding House Selection
- Aim to spend no more than 30-40% of your income on housing
- Consider what's included (utilities, internet, meals)
- Factor in location and transportation costs

### Money-Saving Strategies
- Share rooms when possible
- Look for inclusive packages
- Consider proximity to campus to save on transportation

## Food Budget Management

- Cook your own meals when possible
- Take advantage of student discounts
- Buy in bulk for non-perishables
- Use meal planning to reduce waste

## Emergency Fund

Always set aside 10-15% of your income for unexpected expenses like medical bills, emergency trips home, or urgent school requirements.

Remember, budgeting is a skill that will serve you well beyond your university years!`
  },
];