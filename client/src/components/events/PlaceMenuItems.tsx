
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

type MenuItem = {
  name: string;
  price: number;
  description?: string;
};

type MenuItemsProps = {
  foods?: MenuItem[];
  drinks?: MenuItem[];
};

export function PlaceMenuItems({ foods = [], drinks = [] }: MenuItemsProps) {
  if (!foods?.length && !drinks?.length) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Menu Items</CardTitle>
        <CardDescription>
          Food and drinks available at this venue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {foods?.length > 0 && (
          <>
            <h3 className="font-medium text-lg mb-2">Food</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {foods.map((item, index) => (
                <div key={index} className="flex justify-between p-2 border rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {foods?.length > 0 && drinks?.length > 0 && (
          <Separator className="my-4" />
        )}

        {drinks?.length > 0 && (
          <>
            <h3 className="font-medium text-lg mb-2">Drinks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drinks.map((item, index) => (
                <div key={index} className="flex justify-between p-2 border rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PlaceMenuItems;
