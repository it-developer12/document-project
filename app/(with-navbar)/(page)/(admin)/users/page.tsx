"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { EmployeeRecord } from "@/api/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployeeList } from "@/hooks/create-form";

const PAGE_SIZE = 10;

export default function Page() {
  const { data: employees, isPending, isError, refetch } = useEmployeeList();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeeList = employees ?? [];
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredEmployees = employeeList.filter((employee: EmployeeRecord) =>
    [
      employee.employee_code,
      employee.fullName,
      employee.firstName,
      employee.lastName,
      employee.position.name,
      employee.position.division.name,
      employee.position.department.name,
      employee.company.name,
    ]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch)),
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE),
  );
  const activePage = Math.min(currentPage, pageCount);
  const paginatedEmployees = filteredEmployees.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Browse and search employee records.
          </p>
        </header>

        <div className="mb-4 max-w-md">
          <label
            htmlFor="employee-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search employees
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="employee-search"
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, code, position..."
              className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading employees…
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load employee data.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
                className="h-9 rounded-lg"
              >
                Try again
              </Button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              {employeeList.length === 0
                ? "No employees found."
                : `No employees match “${searchTerm}”.`}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-190 text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 sm:px-6">Employee</th>
                      <th className="px-5 py-3 sm:px-6">Position</th>
                      <th className="px-5 py-3 sm:px-6">Division</th>
                      <th className="px-5 py-3 sm:px-6">Department</th>
                      <th className="px-5 py-3 sm:px-6">Company</th>
                      <th className="px-5 py-3 sm:px-6">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEmployees.map(
                      (employee: EmployeeRecord, index: number) => (
                        <tr
                          key={`${employee.employee_code}-${index}`}
                          className="text-sm text-slate-700"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <p className="font-medium text-slate-900">
                              {employee.fullName ||
                                `${employee.firstName} ${employee.lastName}`}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee.employee_code}
                            </p>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.division.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.department.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.company.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.role}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="text-sm text-slate-600">
                  Showing {(activePage - 1) * PAGE_SIZE + 1}-
                  {Math.min(activePage * PAGE_SIZE, filteredEmployees.length)}{" "}
                  of {filteredEmployees.length} employees
                </span>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activePage <= 1}
                    onClick={() => setCurrentPage(activePage - 1)}
                    className="h-9 rounded-lg border-slate-200 bg-white px-3"
                  >
                    Previous
                  </Button>
                  <span
                    aria-live="polite"
                    className="whitespace-nowrap text-sm text-slate-600"
                  >
                    {activePage} / {pageCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activePage >= pageCount}
                    onClick={() => setCurrentPage(activePage + 1)}
                    className="h-9 rounded-lg border-slate-200 bg-white px-3"
                  >
                    Next
                  </Button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
