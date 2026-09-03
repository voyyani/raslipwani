import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

import Icon from '../../components/Icon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

// Validation schema
const clientSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  client_type: z.enum(['individual', 'corporate', 'investor', 'other']),
  status: z.enum(['lead', 'prospect', 'active', 'inactive']),
  company: z.string().optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'whatsapp', 'any']).optional(),
  preferred_locations: z.string().optional(),
  property_preferences: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

/**
 * The dialog's footer sits outside the form element, so the submit button is
 * bound to it by id rather than by nesting.
 */
const FORM_ID = 'client-form';

/** A titled two-column group. Every field group in this form is one. */
const Section = ({ title, children }) => (
  <section>
    <h3 className="text-lg font-semibold text-content mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </section>
);

Section.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node };

const ClientForm = ({ client, onClose, onSuccess }) => {
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      ...client,
      budget_min: client.budget_min?.toString() || '',
      budget_max: client.budget_max?.toString() || '',
      tags: client.tags?.join(', ') || '',
    } : {
      status: 'lead',
      client_type: 'individual',
      preferred_contact_method: 'any',
      budget_min: '',
      budget_max: '',
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Transform data
      const transformedData = {
        ...data,
        budget_min: data.budget_min ? parseFloat(data.budget_min) : null,
        budget_max: data.budget_max ? parseFloat(data.budget_max) : null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        const { error } = await supabase
          .from('clients')
          .update(transformedData)
          .eq('id', client.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([transformedData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Client updated successfully' : 'Client created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to save client: ${error.message}`);
    },
  });

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'Add New Client'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            loading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            {!saveMutation.isPending && <Icon name="save" size={16} />}
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Client' : 'Create Client'}
          </Button>
        </>
      }
    >
      {/*
        The submit button lives in the dialog footer, outside the <form>, so it
        is associated by `form={FORM_ID}` rather than by nesting. A footer
        button that merely *looked* like a submit would not respond to Enter.
      */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Personal Information">
          <Input
            label="First Name"
            required
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="Last Name"
            required
            {...register('last_name')}
            error={errors.last_name?.message}
          />
          <Input
            label="Email"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone"
            type="tel"
            required
            placeholder="+254 700 000 000"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Select label="Client Type" required {...register('client_type')}>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
            <option value="investor">Investor</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Company" {...register('company')} />
          <Select label="Status" required {...register('status')}>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active Client</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Select label="Source" {...register('source')}>
            <option value="">Select source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="walk-in">Walk-in</option>
            <option value="social-media">Social Media</option>
            <option value="agent">Agent</option>
            <option value="other">Other</option>
          </Select>
        </Section>

        <Section title="Budget & Preferences">
          <Input
            label="Budget Min (KES)"
            type="number"
            placeholder="500000"
            {...register('budget_min')}
          />
          <Input
            label="Budget Max (KES)"
            type="number"
            placeholder="5000000"
            {...register('budget_max')}
          />
          <Select label="Preferred Contact Method" {...register('preferred_contact_method')}>
            <option value="any">Any</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </Select>
          <Input
            label="Preferred Locations"
            placeholder="Westlands, Karen, Runda"
            {...register('preferred_locations')}
          />
          <Textarea
            label="Property Preferences"
            rows={3}
            placeholder="3-bedroom apartment, modern kitchen, parking..."
            className="md:col-span-2"
            {...register('property_preferences')}
          />
          <Textarea
            label="Tags"
            rows={2}
            placeholder="VIP, urgent, investor"
            hint="Separate tags with commas."
            className="md:col-span-2"
            {...register('tags')}
          />
        </Section>

        <div>
          <h3 className="text-lg font-semibold text-content mb-4">Additional Notes</h3>
          <Textarea
            label="Notes"
            rows={4}
            placeholder="Any additional information about this client..."
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
};

ClientForm.propTypes = {
  /** Absent for a new client; present to edit an existing one. */
  client: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ClientForm;
