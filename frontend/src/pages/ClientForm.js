import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await clientsApi.getOne(id);
      const client = response.data;
      setFirstName(client.first_name);
      setLastName(client.last_name);
      setDob(client.dob);
    } catch (err) {
      toast.error('Failed to load client');
      navigate('/clients');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dob,
      };

      if (isEditing) {
        await clientsApi.update(id, data);
        toast.success('Client updated successfully');
        navigate(`/clients/${id}`);
      } else {
        const response = await clientsApi.create(data);
        toast.success('Client created successfully');
        navigate(`/clients/${response.data.id}`);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container-responsive py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="card-shadow">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading client...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      {/* Back button */}
      <Link 
        to={isEditing ? `/clients/${id}` : '/clients'} 
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isEditing ? 'Back to Client' : 'Back to Clients'}
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle data-testid="client-form-title">
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update the client\'s information' 
                : 'Enter the client\'s details to add them to your records'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="client-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    maxLength={100}
                    data-testid="client-first-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    maxLength={100}
                    data-testid="client-last-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  max={dayjs().format('YYYY-MM-DD')}
                  data-testid="client-dob-input"
                />
                {dob && (
                  <p className="text-sm text-muted-foreground">
                    Age: {dayjs().diff(dayjs(dob), 'year')} years old
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(isEditing ? `/clients/${id}` : '/clients')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-press"
                  disabled={loading}
                  data-testid="client-form-submit"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    isEditing ? 'Save Changes' : 'Add Client'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
