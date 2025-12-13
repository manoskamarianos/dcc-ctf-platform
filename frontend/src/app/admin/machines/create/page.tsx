import MachineForm from "../machine-form";

export default function CreateMachinePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    NEW_LOCAL_MACHINE
                </h1>
                <p className="text-gray-400 mt-2">
                    Define parameters for a local simulation target.
                </p>
            </div>

            <MachineForm />
        </div>
    );
}
