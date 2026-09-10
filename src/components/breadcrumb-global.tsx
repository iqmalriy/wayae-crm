"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbItemProps = {
  label: string;
  href?: string;
};

type BreadcrumbContextValue = {
  items: BreadcrumbItemProps[];
  setItems: (items: BreadcrumbItemProps[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbGlobal({
  items: defaultItems = [],
  children,
}: {
  items?: BreadcrumbItemProps[];
  children?: React.ReactNode;
}) {
  const [items, setItems] = useState(defaultItems);
  const value = useMemo(
    () => ({ items, setItems }),
    [items]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbGlobal");
  }
  return context;
}

export function BreadcrumbDisplay() {
  const { items } = useContext(BreadcrumbContext) ?? { items: [] };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={item.label}>
              {isLast || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={item.href} />}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        }).reduce<React.ReactNode[]>((nodes, item, index, arr) => {
          nodes.push(item);
          if (index < arr.length - 1) {
            nodes.push(<BreadcrumbSeparator key={`sep-${index}`} />);
          }
          return nodes;
        }, [])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}