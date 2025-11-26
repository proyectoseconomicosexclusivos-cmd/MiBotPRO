import React from 'react';

export interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'url';
  helpText: string;
  helpUrl?: string;
}

export interface BotTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactElement;
  integrations: string[];
  requiredIntegrations: IntegrationField[];
  price: number;
}

export interface UserConfiguration {
  id: string;
  userId: number;
  templateId: string;
  templateTitle: string;
  businessName: string;
  phone: string;
  email: string;
  hours: string;
  services: string;
  systemPrompt?: string;
  integrationValues: Record<string, string>;
  status: 'pending_payment' | 'processing' | 'active' | 'error';
  createdAt: string; 
}

export interface AppSettings {
  n8nWebhookUrl: string;
  geminiApiKey: string;
  stripePaymentLink?: string; // Nuevo campo para el enlace de suscripción real
}

export interface User {
  id: number;
  email: string;
  name: string;
}