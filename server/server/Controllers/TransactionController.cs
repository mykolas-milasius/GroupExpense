using Microsoft.AspNetCore.Mvc;
using server.Dto;
using server.Models;
using server.Services;
using System.Threading.Tasks;

namespace server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(TransactionDto transactionDto)
    {
        try
        {
            var createdTransaction = await _transactionService.CreateTransactionAsync(transactionDto);
            return CreatedAtAction(nameof(CreateTransaction), new { id = createdTransaction.Id }, createdTransaction);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByGroup(int groupId)
    {
        try
        {
            var transactions = await _transactionService.GetTransactionsByGroupAsync(groupId);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}