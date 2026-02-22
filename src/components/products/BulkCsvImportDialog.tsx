'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import type { CreateProductDto } from '@librestock/types'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useBulkCreateProducts,
  getListProductsQueryKey,
  getGetProductsByCategoryQueryKey,
  type BulkOperationResultDto,
} from '@/lib/data/products'

const REQUIRED_HEADERS = ['sku', 'name', 'category_id', 'reorder_point'] as const

interface ParsedRow {
  data: CreateProductDto
  errors: string[]
  rowIndex: number
}

interface ParseResult {
  rows: ParsedRow[]
  headers: string[]
  totalRows: number
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseOptionalNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null
  const num = Number.parseFloat(value)
  return Number.isNaN(num) ? null : num
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value || value.trim() === '') return defaultValue
  const lower = value.toLowerCase().trim()
  return lower === 'true' || lower === '1' || lower === 'yes'
}

function parseCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) {
    return { rows: [], headers: [], totalRows: 0 }
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const errors: string[] = []
    const record: Record<string, string> = {}

    headers.forEach((header, idx) => {
      record[header] = values[idx] ?? ''
    })

    for (const required of REQUIRED_HEADERS) {
      if (!record[required]) {
        errors.push(`Missing required field: ${required}`)
      }
    }

    const reorderPoint = Number.parseInt(record.reorder_point ?? '0', 10)
    if (record.reorder_point && Number.isNaN(reorderPoint)) {
      errors.push('reorder_point must be a number')
    }

    const data: CreateProductDto = {
      sku: record.sku ?? '',
      name: record.name ?? '',
      category_id: record.category_id ?? '',
      reorder_point: Number.isNaN(reorderPoint) ? 0 : reorderPoint,
      description: record.description || null,
      is_active: parseBoolean(record.is_active, true),
      is_perishable: parseBoolean(record.is_perishable, false),
      barcode: record.barcode || null,
      unit: record.unit || null,
      standard_cost: parseOptionalNumber(record.standard_cost),
      standard_price: parseOptionalNumber(record.standard_price),
      weight_kg: parseOptionalNumber(record.weight_kg),
      volume_ml: parseOptionalNumber(record.volume_ml),
      dimensions_cm: record.dimensions_cm || null,
      notes: record.notes || null,
    }

    rows.push({ data, errors, rowIndex: i })
  }

  return { rows, headers, totalRows: lines.length - 1 }
}

function CsvPreviewTable({
  parseResult,
  validCount,
  errorCount,
}: {
  parseResult: ParseResult
  validCount: number
  errorCount: number
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex items-center gap-4 text-sm">
        <span>
          {t('bulk.totalRows') || 'Total rows'}:{' '}
          <strong>{parseResult.totalRows}</strong>
        </span>
        <span className="text-green-600">
          {t('bulk.validRows') || 'Valid'}:{' '}
          <strong>{validCount}</strong>
        </span>
        {errorCount > 0 && (
          <span className="text-destructive">
            {t('bulk.errorRows') || 'Errors'}:{' '}
            <strong>{errorCount}</strong>
          </span>
        )}
      </div>

      <div className="max-h-60 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('form.productSku') || 'SKU'}</TableHead>
              <TableHead>{t('form.productName') || 'Name'}</TableHead>
              <TableHead>{t('form.reorderPoint') || 'Reorder Pt.'}</TableHead>
              <TableHead>{t('form.isActive') || 'Active'}</TableHead>
              <TableHead>{t('bulk.status') || 'Status'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parseResult.rows.slice(0, 50).map((row) => (
              <TableRow
                key={row.rowIndex}
                className={row.errors.length > 0 ? 'bg-destructive/5' : ''}
              >
                <TableCell className="text-muted-foreground text-xs">
                  {row.rowIndex}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {row.data.sku}
                </TableCell>
                <TableCell className="text-sm">{row.data.name}</TableCell>
                <TableCell className="text-sm">
                  {row.data.reorder_point}
                </TableCell>
                <TableCell className="text-sm">
                  {row.data.is_active ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  {row.errors.length > 0 ? (
                    <span className="text-destructive text-xs">
                      {row.errors.join(', ')}
                    </span>
                  ) : (
                    <span className="text-xs text-green-600">
                      {t('bulk.valid') || 'Valid'}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {parseResult.rows.length > 50 && (
          <p className="text-muted-foreground p-2 text-center text-xs">
            {t('bulk.showingFirst', { count: 50 }) || 'Showing first 50 rows'}
          </p>
        )}
      </div>
    </>
  )
}

export function BulkCsvImportDialog(): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(
    null,
  )
  const [fileName, setFileName] = React.useState<string>('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const bulkCreateMutation = useBulkCreateProducts({
    mutation: {
      onSuccess: async (result: BulkOperationResultDto) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetProductsByCategoryQueryKey(),
          }),
        ])

        if (result.failure_count > 0 && result.success_count > 0) {
          toast.warning(
            t('bulk.importPartial') || 'Import partially completed',
            {
              description:
                t('bulk.importResult', {
                  success: result.success_count,
                  failure: result.failure_count,
                }) ||
                `${result.success_count} created, ${result.failure_count} failed`,
            },
          )
        } else if (result.failure_count > 0) {
          toast.error(t('bulk.importError') || 'Import failed', {
            description:
              result.failures
                .map((f) => `${f.sku ?? f.id ?? 'Unknown'}: ${f.error}`)
                .join('; ') || `${result.failure_count} failed`,
          })
        } else {
          toast.success(t('bulk.importSuccess') || 'Products imported', {
            description:
              t('bulk.importSuccessCount', {
                count: result.success_count,
              }) || `${result.success_count} products created`,
          })
        }

        setOpen(false)
        setParseResult(null)
        setFileName('')
      },
      onError: () => {
        toast.error(t('bulk.importError') || 'Failed to import products')
      },
    },
  })

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setParseResult(parseCsv(text))
    }
    reader.readAsText(file)
  }

  const handleImport = (): void => {
    if (!parseResult) return
    const validRows = parseResult.rows.filter((row) => row.errors.length === 0)
    if (validRows.length === 0) {
      toast.error(t('bulk.noValidRows') || 'No valid rows to import')
      return
    }
    bulkCreateMutation.mutate({
      data: { products: validRows.map((row) => row.data) },
    })
  }

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setParseResult(null)
      setFileName('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const validCount =
    parseResult?.rows.filter((row) => row.errors.length === 0).length ?? 0
  const errorCount =
    parseResult?.rows.filter((row) => row.errors.length > 0).length ?? 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" data-icon="inline-start" />
          {t('bulk.csvImport') || 'CSV Import'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {t('bulk.csvImportTitle') || 'Import Products from CSV'}
          </DialogTitle>
          <DialogDescription>
            {t('bulk.csvImportDescription') ||
              'Upload a CSV file with product data. Required columns: sku, name, category_id, reorder_point.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <label
            className="border-input hover:bg-accent flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors"
            htmlFor="csv-upload"
          >
            <Upload className="text-muted-foreground size-8" />
            <span className="text-sm font-medium">
              {fileName || t('bulk.dropCsv') || 'Click to select a CSV file'}
            </span>
            <span className="text-muted-foreground text-xs">
              {t('bulk.csvFormat') ||
                'Columns: sku, name, category_id, reorder_point, is_active, is_perishable, ...'}
            </span>
          </label>
          <input
            ref={fileInputRef}
            accept=".csv,text/csv"
            className="hidden"
            id="csv-upload"
            type="file"
            onChange={handleFileChange}
          />

          {parseResult !== null && (
            <CsvPreviewTable
              errorCount={errorCount}
              parseResult={parseResult}
              validCount={validCount}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('form.cancel') || 'Cancel'}</Button>
          </DialogClose>
          <Button
            disabled={
              !parseResult || validCount === 0 || bulkCreateMutation.isPending
            }
            onClick={handleImport}
          >
            {bulkCreateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-3" />
                {t('bulk.importing') || 'Importing...'}
              </span>
            ) : (
              t('bulk.importButton', { count: validCount }) ||
              `Import ${validCount} Products`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
