using Microsoft.AspNetCore.Mvc;
     using Microsoft.EntityFrameworkCore;
     using server.Data;
     using server.Models;

     namespace server.Controllers;

     [Route("api/[controller]")]
     [ApiController]
     public class GroupsController : ControllerBase
     {
         private readonly AppDbContext _context;

         public GroupsController(AppDbContext context)
         {
             _context = context;
         }

         // GET: api/Groups
         [HttpGet]
         public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
         {
             return await _context.Groups.ToListAsync();
         }

         // GET: api/Groups/5
         [HttpGet("{id}")]
         public async Task<ActionResult<Group>> GetGroup(int id)
         {
             var group = await _context.Groups.FindAsync(id);
             if (group == null)
             {
                 return NotFound();
             }
             return group;
         }

         // POST: api/Groups
         [HttpPost]
         public async Task<ActionResult<Group>> PostGroup(Group group)
         {
             _context.Groups.Add(group);
             await _context.SaveChangesAsync();
             return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
         }

         // PUT: api/Groups/5
         [HttpPut("{id}")]
         public async Task<IActionResult> PutGroup(int id, Group group)
         {
             if (id != group.Id)
             {
                 return BadRequest();
             }

             _context.Entry(group).State = EntityState.Modified;
             try
             {
                 await _context.SaveChangesAsync();
             }
             catch (DbUpdateConcurrencyException)
             {
                 if (!_context.Groups.Any(e => e.Id == id))
                 {
                     return NotFound();
                 }
                 throw;
             }
             return NoContent();
         }

         // DELETE: api/Groups/5
         [HttpDelete("{id}")]
         public async Task<IActionResult> DeleteGroup(int id)
         {
             var group = await _context.Groups.FindAsync(id);
             if (group == null)
             {
                 return NotFound();
             }

             _context.Groups.Remove(group);
             await _context.SaveChangesAsync();
             return NoContent();
         }
     }