import { Input } from './input';

interface VectorInputProps {
  value: number[] | undefined;
  dimension: 2 | 3 | 4;
  integer?: boolean;
  onChange: (value: number[]) => void;
  placeholder?: string;
  isMixed?: boolean;
}

export function VectorInput({ value, dimension, integer, onChange, placeholder, isMixed }: VectorInputProps) {
  const arr = Array.isArray(value) ? [...value] : Array(dimension).fill(0);

  const labels = ['x', 'y', 'z', 'w'].slice(0, dimension);

  const handleChange = (index: number, val: string) => {
    const parsed = integer ? parseInt(val, 10) : parseFloat(val);
    if (!Number.isNaN(parsed)) {
      arr[index] = parsed;
      onChange(arr);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {labels.map((label, idx) => (
        <div key={label} className="flex items-center space-x-1">
          <span className="text-sm">{label}</span>
          <Input
            type="number"
            className="w-20"
            step={integer ? 1 : 'any'}
            value={isMixed ? '' : (arr[idx] ?? '')}
            onChange={(e) => handleChange(idx, e.target.value)}
            placeholder={isMixed ? '-' : placeholder}
          />
        </div>
      ))}
    </div>
  );
}
