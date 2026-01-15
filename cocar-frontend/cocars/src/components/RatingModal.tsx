// src/components/RatingModal.tsx
import { useState } from "react";
import { Star, X, Loader2, Check } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  tripInfo: string;
  ratingType: "driver" | "passenger";
  onSubmit: (data: {
    rating: number;
    comment: string;
    punctuality: number;
    communication: number;
    comfort?: number;
  }) => Promise<void>;
}

export default function RatingModal({
  isOpen,
  onClose,
  userName,
  tripInfo,
  ratingType,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [punctuality, setPunctuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comfort, setComfort] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment,
        punctuality: punctuality || rating,
        communication: communication || rating,
        comfort: ratingType === "driver" ? (comfort || rating) : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset
        setRating(0);
        setComment("");
        setPunctuality(0);
        setCommunication(0);
        setComfort(0);
        setSuccess(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    size = "lg",
  }: {
    value: number;
    onChange: (v: number) => void;
    size?: "sm" | "lg";
  }) => {
    const [hover, setHover] = useState(0);
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`${size === "lg" ? "w-10 h-10" : "w-6 h-6"} transition-colors ${
                star <= (hover || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Merci pour votre avis !</h3>
          <p className="text-gray-500 mt-2">Votre évaluation a été enregistrée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Évaluer {ratingType === "driver" ? "le conducteur" : "le passager"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-black">
                {userName.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{userName}</h3>
            <p className="text-sm text-gray-500">{tripInfo}</p>
          </div>

          {/* Main rating */}
          <div className="text-center">
            <p className="text-gray-700 mb-3">Comment était votre expérience ?</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rating === 0 && "Sélectionnez une note"}
              {rating === 1 && "Très mauvais"}
              {rating === 2 && "Mauvais"}
              {rating === 3 && "Correct"}
              {rating === 4 && "Bien"}
              {rating === 5 && "Excellent !"}
            </p>
          </div>

          {/* Detailed ratings */}
          {rating > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <p className="font-medium text-gray-900">Détails (optionnel)</p>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ponctualité</span>
                <StarRating value={punctuality} onChange={setPunctuality} size="sm" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Communication</span>
                <StarRating value={communication} onChange={setCommunication} size="sm" />
              </div>
              
              {ratingType === "driver" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confort du véhicule</span>
                  <StarRating value={comfort} onChange={setComfort} size="sm" />
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Décrivez votre expérience avec ${userName}...`}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
          >
            Plus tard
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Envoyer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
