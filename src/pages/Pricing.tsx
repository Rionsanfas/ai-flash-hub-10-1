import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: '$20',
      yearlyPrice: '$200',
      monthlyLink: 'https://buy.polar.sh/polar_cl_AywFSsUoNMSkjgtN0ymyijKK34LIGtXNwD8ur1mGWGd',
      yearlyLink: 'https://buy.polar.sh/polar_cl_ZwBFKnqzzP5wtgjBksgr3EyPotucqeHpYuz9j0UArB7',
      features: [
        'Up to 500 flashcards/month',
        '20 tokens for uploads/chat',
        'AI chat (basic)',
        'Study mode',
        'Secure storage'
      ]
    },
    {
      name: 'Pro',
      monthlyPrice: '$50',
      yearlyPrice: '$500',
      monthlyLink: 'https://buy.polar.sh/polar_cl_5igPIFTuvGn9pfZRdS8ri7LtJyJ7MXB5Z1fAb4czLQM',
      yearlyLink: 'https://buy.polar.sh/polar_cl_rssq9pFo5YpwHS6U7pbI4z7Fv3WJu6fQuKD860SdItA',
      features: [
        'Up to 1,250 flashcards/month',
        '50 tokens for uploads/chat',
        'Advanced difficulty levels',
        'Study analytics',
        'Larger uploads'
      ],
      recommended: true
    },
    {
      name: 'Premium',
      monthlyPrice: '$100',
      yearlyPrice: '$1,000',
      monthlyLink: 'https://buy.polar.sh/polar_cl_Friuq7vcdALCwiHLnPa1xPDFunAX6sexGY6HO0ejaVC',
      yearlyLink: 'https://buy.polar.sh/polar_cl_EAlPVnFk8sxwSWB0sXvmZqb2qpx6GrntPXPrl0HokEA',
      features: [
        'Up to 2,500 flashcards/month',
        '100 tokens for uploads/chat',
        'Unlimited upload size',
        'Extended AI chat',
        'Advanced analytics'
      ]
    }
  ];

  const toggleBilling = (checked: boolean) => {
    setIsYearly(checked);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">Select the perfect plan for your study needs</p>
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Label htmlFor="billing-toggle" className="text-sm font-medium">Monthly</Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={toggleBilling}
          />
          <Label htmlFor="billing-toggle" className="text-sm font-medium">Yearly (Save 17%)</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const link = isYearly ? plan.yearlyLink : plan.monthlyLink;

          return (
            <Card key={index} className={plan.recommended ? 'border-primary' : ''}>
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Recommended</Badge>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">{price}</div>
                <CardDescription className="text-lg">
                  {isYearly ? '/year' : '/month'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.recommended ? 'default' : 'outline'}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    Get {plan.name}
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;