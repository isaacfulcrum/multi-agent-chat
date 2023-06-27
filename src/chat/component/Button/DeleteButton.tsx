import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";

type Props = {
  onClick: () => void;
};

// ********************************************************************************
export const DeleteButton: React.FC<Props> = ({ onClick }) => {
  return (
    <IconButton
      size="xs"
      fontSize="14px"
      onClick={onClick}
      variant="outline"
      aria-label="Delete"
      icon={<DeleteIcon />}
      colorScheme="whiteAlpha"
    />
  );
};

export default DeleteButton;
