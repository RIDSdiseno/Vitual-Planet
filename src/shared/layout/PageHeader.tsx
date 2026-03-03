import React from "react";

export default function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
      
      {/* Bloque izquierdo */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vp-text">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-vp-muted">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bloque derecho */}
      {right && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {right}
        </div>
      )}
    </div>
  );
}