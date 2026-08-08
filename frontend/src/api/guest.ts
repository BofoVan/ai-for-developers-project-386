import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';

export function usePublicEventTypes() {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data } = await client.GET('/api/event-types');
      return data ?? [];
    },
  });
}

export function useAvailableSlots(eventTypeId: string | undefined, from?: string, to?: string) {
  return useQuery({
    queryKey: ['slots', eventTypeId, from, to],
    queryFn: async () => {
      if (!eventTypeId) return [];
      const { data } = await client.GET('/api/event-types/{eventTypeId}/slots', {
        params: {
          path: { eventTypeId },
          query: { from, to },
        },
      });
      return data ?? [];
    },
    enabled: !!eventTypeId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      eventTypeId: string;
      slotStart: string;
      guestName: string;
      guestEmail: string;
    }) => {
      const { data, error } = await client.POST('/api/bookings', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}
