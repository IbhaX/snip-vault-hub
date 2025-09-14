import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit, 
  Key, 
  CreditCard, 
  Shield, 
  Server 
} from "lucide-react";
import { useUserSecrets, CreateSecretData, UpdateSecretData } from "@/hooks/useUserSecrets";
import { useToast } from "@/hooks/use-toast";

export const SecretsVault = () => {
  const { secrets, loading, createSecret, updateSecret, deleteSecret } = useUserSecrets();
  const { toast } = useToast();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CreateSecretData>({
    title: "",
    username: "",
    secret_type: "password",
    value: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      username: "",
      secret_type: "password",
      value: "",
      notes: "",
    });
    setEditingSecret(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.value.trim()) {
      toast({
        title: "Error",
        description: "Title and secret value are required",
        variant: "destructive",
      });
      return;
    }

    const success = editingSecret 
      ? await updateSecret(editingSecret, formData)
      : await createSecret(formData);

    if (success || !editingSecret) {
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleEdit = (secret: any) => {
    setFormData({
      title: secret.title,
      username: secret.username || "",
      secret_type: secret.secret_type,
      value: "", // Don't pre-fill for security
      notes: secret.notes || "",
    });
    setEditingSecret(secret.id);
    setShowAddModal(true);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = (secretId: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(secretId)) {
      newVisible.delete(secretId);
    } else {
      newVisible.add(secretId);
    }
    setVisibleSecrets(newVisible);
  };

  const getSecretTypeIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />;
      case 'api_key': return <Server className="h-4 w-4" />;
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'other': return <Shield className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getSecretTypeColor = (type: string) => {
    switch (type) {
      case 'password': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'api_key': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'credit_card': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'other': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secrets Vault</h2>
          <p className="text-muted-foreground">Securely store passwords, API keys, and other sensitive information</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-glass border-glass backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>{editingSecret ? 'Edit Secret' : 'Add New Secret'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Gmail Password, GitHub API Key"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-glass border-glass"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_type">Type</Label>
                <Select
                  value={formData.secret_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, secret_type: value }))}
                >
                  <SelectTrigger className="bg-glass border-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-glass border-glass backdrop-blur-md">
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username/Email</Label>
                <Input
                  id="username"
                  placeholder="Optional"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-glass border-glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Secret Value *</Label>
                <Input
                  id="value"
                  type="password"
                  placeholder="Enter the secret value"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  className="bg-glass border-glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-glass border-glass"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="border-glass"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  {editingSecret ? 'Update' : 'Save'} Secret
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {secrets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold mb-2">No secrets stored yet</h3>
          <p className="text-muted-foreground">Start by adding your first secret to keep it safe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secrets.map((secret) => (
            <Card key={secret.id} className="bg-glass/50 border-glass hover:bg-glass/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getSecretTypeColor(secret.secret_type)}`}>
                      {getSecretTypeIcon(secret.secret_type)}
                    </div>
                    <Badge variant="outline" className={`text-xs ${getSecretTypeColor(secret.secret_type)} border`}>
                      {secret.secret_type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(secret)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSecret(secret.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold">{secret.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {secret.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Username:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono">{secret.username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(secret.username!, 'Username')}
                        className="h-5 w-5 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Secret:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-mono">
                      {visibleSecrets.has(secret.id) ? '••••••••' : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(secret.id)}
                      className="h-5 w-5 p-0"
                    >
                      {visibleSecrets.has(secret.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {secret.notes && (
                  <div className="pt-2 border-t border-glass">
                    <p className="text-xs text-muted-foreground line-clamp-2">{secret.notes}</p>
                  </div>
                )}

                <div className="pt-2 text-xs text-muted-foreground">
                  Created: {new Date(secret.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};