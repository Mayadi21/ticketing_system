import CreateTicketForm from '@/components/ticket/CreateTicketForm'; // Sesuaikan path-nya



export default function BranchNewTicketPage() {
    // Karena role = "branch", form akan otomatis menyembunyikan 
    // dropdown cabang & engineer sesuai logika (isAdmin) di dalam komponen
    return (
        <CreateTicketForm role="branch" />
    );
}