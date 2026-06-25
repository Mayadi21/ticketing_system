import CreateTicketForm from '@/components/ticket/CreateTicketForm';
import { getTicketMetadata } from '@/app/actions/ticket';

export default async function NewTicketPage() {
    // 1. Ambil data asli dari Supabase melalui Server Action
    const { branches, engineers } = await getTicketMetadata();

    // 2. Oper data tersebut ke Client Component
    return (
        <CreateTicketForm 
            role="admin" 
            branches={branches} 
            engineers={engineers} 
        />
    );
}
