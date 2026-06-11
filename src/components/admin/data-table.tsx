"use client";

/**
 * Reusable, paginated data table built on @tanstack/react-table — harvested from
 * the shadcn studio `datatable-component` block and adapted for the MLGRD admin.
 * Generic over the row type; columns are supplied per section.
 */
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";

export function DataTable<TData>({
  columns,
  data,
  pageSize = 8,
  emptyLabel = "No results.",
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageSize?: number;
  emptyLabel?: string;
}) {
  // TanStack Table returns non-memoizable instances; opt this component out of
  // the React Compiler (per TanStack guidance) to silence the incompatible-
  // library warning. No behavioural change.
  "use no memo";

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 3,
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto border-b">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground h-12 first:pl-4"
                    style={
                      header.column.columnDef.size
                        ? { width: header.column.columnDef.size }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="first:pl-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-3 px-4 py-4 max-sm:flex-col">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            Showing{" "}
            <span className="text-foreground font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              –
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getRowCount(),
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-medium">
              {table.getRowCount()}
            </span>
          </p>

          <Pagination className="mx-0 w-fit">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map((page) => {
                const isActive =
                  page === table.getState().pagination.pageIndex + 1;
                return (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                );
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
