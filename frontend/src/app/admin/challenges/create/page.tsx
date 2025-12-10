import ChallengeForm from "./challenge-form";

export default function CreateChallengePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    NEW_CHALLENGE
                </h1>
                <p className="text-gray-400 mt-2">
                    Configure a new task for the operatives.
                </p>
            </div>

            <ChallengeForm />
        </div>
    );
}
