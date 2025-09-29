import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import { fullSchema } from "@/app/page";

type FormValues = z.infer<typeof fullSchema>;

interface FormState {
  formData: Partial<FormValues>;
  step: number;
  setFormData: (data: Partial<FormValues>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const defaultFormData: Partial<FormValues> = {
  objectifs: [],
  pages: [],
  fonctionnalites: [],
  typesProduitsServices: [],
  besoinsSpecifiques: [],
  webMobile: [],
  designAssets: [],
  stylePrefere: [],
  besoinsMaintenance: [],
  plateformesCM: [],
  besoinsComDigitale: [],
  accompagnementSEO: [],
  actionsAvis: [],
};

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      step: 0,
      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setStep: (step) => set({ step }),
      reset: () =>
        set({
          formData: defaultFormData,
          step: 0,
        }),
    }),
    {
      name: "form-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
