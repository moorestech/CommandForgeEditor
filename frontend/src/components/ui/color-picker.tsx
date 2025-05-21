import React from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [color, setColor] = React.useState(value || "#c9c9c9");

  React.useEffect(() => {
    setColor(value || "#c9c9c9");
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer"
              style={{ backgroundColor: color }}
              aria-label="Pick a color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={color} onChange={handleColorChange} />
          </PopoverContent>
        </Popover>
        <Input
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-28"
        />
      </div>
    </div>
  );
}
