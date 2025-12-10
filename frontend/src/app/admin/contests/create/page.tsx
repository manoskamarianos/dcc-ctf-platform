import ContestForm from "../contest-form";

export default function CreateContestPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    SCHEDULE_EVENT
                </h1>
                <p className="text-gray-400 mt-2">
                    Initialize a new competitive timeframe.
                </p>
            </div>

            <ContestForm />
        </div>
    );
}
