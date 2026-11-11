"use client"
import { memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

dayjs.extend(utc)
dayjs.extend(timezone)

function isPastEndDate(value: unknown) {
    if (!value || typeof value !== "object" || !("end_date" in value)) {
        return false
    }

    const endDate = value.end_date
    if (typeof endDate !== "string" || !endDate) {
        return false
    }

    const parsedEndDate = dayjs.utc(endDate).tz("Asia/Bangkok")
    if (!parsedEndDate.isValid()) {
        return false
    }

    return dayjs().tz("Asia/Bangkok").startOf("day").isAfter(
        parsedEndDate.startOf("day"),
    )
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    emptyMessage?: string
    previousPageLabel?: string
    nextPageLabel?: string
    pageSize?: number
}

function DataTableComponent<TData, TValue>({
    columns,
    data,
    emptyMessage = "No results.",
    previousPageLabel = "Previous",
    nextPageLabel = "Next",
    pageSize = 10,
}: DataTableProps<TData, TValue>) {
    const router = useRouter()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize,
            },
        },
    })
    // console.log("Cell", table.getRowModel().rows.map((row) => row.getVisibleCells()))
    // const status = ["Draft", "Approved", "Processing", "Completed", "Cancelled", "Pending"];
    return (
        <div>
            <div className="overflow-hidden border-b">
                <Table className="">
                    <TableHeader className="bg-[#dddddd]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className={
                                                header.column.getCanSort()
                                                    ? "cursor-pointer select-none"
                                                    : ""
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}

                                                {{
                                                    asc: " ↑",
                                                    desc: " ↓",
                                                }[header.column.getIsSorted() as string] ?? ""}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={``}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            {cell.column.id === "end_date" &&
                                                isPastEndDate(row.original) && (
                                                    <span
                                                        className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                                                        title="เอกสารเกินกำหนด"
                                                    >
                                                        เกินกำหนด
                                                    </span>
                                                )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-end space-x-2 p-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {previousPageLabel}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {nextPageLabel}
                    </Button>
                </div>
            )}
        </div>
    )
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent
