import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmarDelecaoDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  isConfirming: boolean
}

export function ConfirmarDelecaoDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  title,
  description,
  isConfirming,
}: ConfirmarDelecaoDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault() // Prevenir fechamento do modal antes da confirmação
                onConfirm()
              }}
              disabled={isConfirming}
              aria-label="Confirmar exclusão"
            >
              {isConfirming ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 