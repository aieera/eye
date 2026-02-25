import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DynamicFormConfig, FormFieldConfig } from "@/shared/types/form";
import { useState } from "react";

interface DynamicFormProps {
  config: DynamicFormConfig;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const DynamicForm = ({ config, defaultValues, onSubmit, isLoading, submitLabel = "Submit" }: DynamicFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: defaultValues || {},
  });

  const colsClass: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };
  const spanClass: Record<number, string> = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-4xl mx-auto ">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className={cn("grid gap-6 grid-cols-1", colsClass[config.columns || 4])}>
          {config.fields.map((field) => (
            <div key={field.name} className={spanClass[field.colSpan || 1]}>
              <FieldRenderer field={field} register={register} setValue={setValue} watch={watch} errors={errors} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2 px-2">
        <Button type="submit" variant="minimal" disabled={isLoading} className="min-w-[120px] shadow-md hover:shadow-lg transition-shadow">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

interface FieldRendererProps {
  field: FormFieldConfig;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

const FieldRenderer = ({ field, register, setValue, watch, errors }: FieldRendererProps) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const error = errors[field.name];
  const value = watch(field.name);

  switch (field.type) {
    case "text":
    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} variant="minimal">{field.label}</Label>
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            variant="minimal"
            {...register(field.name, { valueAsNumber: field.type === "number" })}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} variant="minimal">{field.label}</Label>
          <Textarea 
            id={field.name} 
            placeholder={field.placeholder} 
            variant="minimal"
            {...register(field.name)} 
            rows={3} 
          />
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label variant="minimal">{field.label}</Label>
          <Select value={value || ""} onValueChange={(v) => setValue(field.name, v, { shouldValidate: true })}>
            <SelectTrigger variant="minimal">
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    case "date":
      return (
        <div className="space-y-2">
          <Label variant="minimal">{field.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn("w-full justify-start text-left font-normal border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md shadow-sm transition", !value && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(d) => setValue(field.name, d?.toISOString(), { shouldValidate: true })}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-3 pt-6">
          <Checkbox
            id={field.name}
            checked={!!value}
            onCheckedChange={(v) => setValue(field.name, v, { shouldValidate: true })}
            className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
          />
          <Label htmlFor={field.name} variant="minimal">{field.label}</Label>
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    case "file":
      return (
        <div className="space-y-2">
          <Label variant="minimal">{field.label}</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors bg-gray-50">
            <input
              type="file"
              accept={field.accept}
              className="hidden"
              id={field.name}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue(field.name, file, { shouldValidate: true });
                  setFilePreview(URL.createObjectURL(file));
                }
              }}
            />
            <label htmlFor={field.name} className="cursor-pointer space-y-2 block">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-lg" />
              ) : (
                <Upload className="mx-auto h-8 w-8 text-gray-500" />
              )}
              <p className="text-sm text-gray-500">Click to upload</p>
            </label>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error.message as string}</p>}
        </div>
      );

    default:
      return null;
  }
};

export default DynamicForm;