import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => void;
  playlistName: string;
  version: number;
}

export default function PublishDialog({ open, onOpenChange, onPublish, playlistName, version }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Playlist?</DialogTitle>
          <DialogDescription>
            This will push <strong>v{version}</strong> of "<strong>{playlistName}</strong>" to all
            screens currently scheduled to show this playlist. Screens will receive the update in real-time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onPublish} className="bg-primary hover:bg-primary/90">Publish Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
