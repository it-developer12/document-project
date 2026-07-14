export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 shadow-sm mt-auto">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Document Workflow. All rights reserved.
            </div>
        </footer>
    )
}