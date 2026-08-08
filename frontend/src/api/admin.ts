import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';

// --- Event Types ---

export function useAdminEventTypes() {
  return useQuery({
    queryKey: ['admin', 'event-types'],
    queryFn: async () => {
      const { data } = await client.GET('/admin/event-types');
      return data ?? [];
    },
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; description: string; durationMinutes: number }) => {
      const { data } = await client.POST('/admin/event-types', { body });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event-types'] });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventTypeId: string) => {
      await client.DELETE('/admin/event-types/{eventTypeId}', {
        params: { path: { eventTypeId } },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event-types'] });
    },
  });
}

// --- Bookings ---

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const { data } = await client.GET('/admin/bookings');
      return data ?? [];
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      await client.DELETE('/admin/bookings/{bookingId}', {
        params: { path: { bookingId } },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}
