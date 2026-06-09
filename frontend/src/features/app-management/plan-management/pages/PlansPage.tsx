import { useEffect } from 'react';
import { PageWrapper } from '@common/Datatable';
import { 
  useGetSubscriptionPlansQuery, 
  useCreateSubscriptionPlanMutation, 
  useUpdateSubscriptionPlanMutation, 
  useDeleteSubscriptionPlanMutation 
} from '../../../../api/masterApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { PlansTable } from '../components/PlansTable';
import type { ISubscriptionPlan } from '../types/plans.types';
import type { PlanFormData } from '../schema/plan.schema';

export function PlansPage() {
  const { data: plansRes, error } = useGetSubscriptionPlansQuery();
  const [createPlan] = useCreateSubscriptionPlanMutation();
  const [updatePlan] = useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();
  
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  useEffect(() => {
    if (error) {
      const msg = (error && typeof error === 'object' && 'data' in error)
        ? (error.data as { message?: string })?.message 
        : 'Failed to fetch subscription plans';
      notifier.showError(msg || 'Failed to fetch subscription plans');
    }
  }, [error, notifier]);

  const handleCreateOrEdit = (plan: ISubscriptionPlan | null = null) => {
    openDialog('PLAN_FORM', {
      plan,
      onSubmit: async (data: PlanFormData) => {
        try {
          if (plan) {
            await updatePlan({ id: plan._id, body: data }).unwrap();
            notifier.showSuccess('Subscription plan updated successfully!');
          } else {
            await createPlan(data).unwrap();
            notifier.showSuccess('Subscription plan created successfully!');
          }
          closeDialog();
        } catch (err: unknown) {
          const msg = (err && typeof err === 'object' && 'data' in err)
            ? (err.data as { message?: string })?.message 
            : 'Failed to save subscription plan';
          notifier.showError(msg || 'Failed to save subscription plan');
        }
      }
    });
  };

  const handleDelete = (plan: ISubscriptionPlan) => {
    openDialog('CONFIRMATION', {
      title: 'Delete Subscription Plan',
      message: `Are you sure you want to delete the plan "${plan.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deletePlan(plan._id).unwrap();
          notifier.showSuccess('Subscription plan deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = (err && typeof err === 'object' && 'data' in err)
            ? (err.data as { message?: string })?.message 
            : 'Failed to delete subscription plan';
          notifier.showError(msg || 'Failed to delete subscription plan');
        }
      }
    });
  };

  const plans = plansRes?.success ? plansRes.data : [];

  return (
    <PageWrapper 
      title="Plans Management" 
      onCreate={() => handleCreateOrEdit(null)} 
      createLabel="Create Plan"
    >
      <PlansTable 
        plans={plans} 
        onEdit={handleCreateOrEdit} 
        onDelete={handleDelete} 
      />
    </PageWrapper>
  );
}
