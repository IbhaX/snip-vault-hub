import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserSecret {
  id: string;
  title: string;
  username?: string;
  secret_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSecretData {
  title: string;
  username?: string;
  secret_type?: string;
  value: string;
  notes?: string;
}

export interface UpdateSecretData {
  title?: string;
  username?: string;
  secret_type?: string;
  value?: string;
  notes?: string;
}

export const useUserSecrets = () => {
  const [secrets, setSecrets] = useState<UserSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSecrets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('secrets-vault', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setSecrets(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching secrets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSecret = async (secretData: CreateSecretData): Promise<UserSecret | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('secrets-vault', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: secretData,
      });

      if (error) throw error;
      
      const newSecret = data as UserSecret;
      setSecrets(prev => [newSecret, ...prev]);
      
      toast({
        title: "Secret saved",
        description: "Your secret has been securely stored.",
      });
      
      return newSecret;
    } catch (error: any) {
      toast({
        title: "Error saving secret",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSecret = async (id: string, updateData: UpdateSecretData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke(`secrets-vault/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: updateData,
      });

      if (error) throw error;
      
      const updatedSecret = data as UserSecret;
      setSecrets(prev => prev.map(s => s.id === id ? updatedSecret : s));
      
      toast({
        title: "Secret updated",
        description: "Your secret has been updated.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating secret",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSecret = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke(`secrets-vault/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      setSecrets(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "Secret deleted",
        description: "Your secret has been permanently deleted.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting secret",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, [user]);

  return {
    secrets,
    loading,
    createSecret,
    updateSecret,
    deleteSecret,
    refetch: fetchSecrets,
  };
};